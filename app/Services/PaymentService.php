<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentLog;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Konfigurasi Midtrans SDK
     */
    private function configure(): void
    {
        \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);
        \Midtrans\Config::$isSanitized  = true;
        \Midtrans\Config::$is3ds        = true;
    }

    /**
     * Buat Snap Token dari Midtrans untuk membuka popup pembayaran
     *
     * @param Order $order
     * @return string snap_token
     * @throws \Exception
     */
    public function createSnapToken(Order $order): string
    {
        $this->configure();

        $order->load(['items', 'shipping']);

        // Build item_details untuk Midtrans
        $itemDetails = $order->items->map(function ($item) {
            return [
                'id'       => (string) $item->id,
                'price'    => (int) $item->unit_price,
                'quantity' => (int) $item->quantity,
                'name'     => mb_substr($item->product_name . ' - ' . $item->variant_label, 0, 50),
            ];
        })->toArray();

        // Tambahkan ongkir sebagai item
        if ($order->shipping_cost > 0) {
            $itemDetails[] = [
                'id'       => 'SHIPPING',
                'price'    => (int) $order->shipping_cost,
                'quantity' => 1,
                'name'     => 'Ongkos Kirim (' . strtoupper($order->shipping?->courier ?? '') . ')',
            ];
        }

        // Customer details
        $customerDetails = [
            'first_name' => $order->shipping?->recipient_name ?? 'Pembeli',
            'email'      => $order->user?->email ?? '',
            'phone'      => $order->shipping?->phone ?? '',
        ];

        // Shipping address
        $shippingAddress = [
            'first_name'   => $order->shipping?->recipient_name ?? '',
            'phone'        => $order->shipping?->phone ?? '',
            'address'      => $order->shipping?->address ?? '',
            'city'         => $order->shipping?->city ?? '',
            'postal_code'  => $order->shipping?->postal_code ?? '',
            'country_code' => 'IDN',
        ];

        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total_amount,
            ],
            'item_details'     => $itemDetails,
            'customer_details' => array_merge($customerDetails, [
                'shipping_address' => $shippingAddress,
            ]),
            'callbacks' => [
                'finish' => url('/order/' . $order->id . '/success'),
            ],
        ];

        Log::info('Midtrans createSnapToken params', [
            'order_number' => $order->order_number,
            'gross_amount' => $order->total_amount,
        ]);

        $snapToken = \Midtrans\Snap::getSnapToken($params);

        // Simpan snap token ke order
        $order->update(['snap_token' => $snapToken]);

        return $snapToken;
    }

    /**
     * Validasi signature dari Midtrans webhook notification
     *
     * @param array $payload
     * @return bool
     */
    public function validateWebhookSignature(array $payload): bool
    {
        $serverKey   = config('services.midtrans.server_key');
        $orderId     = $payload['order_id'] ?? '';
        $statusCode  = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        $receivedSignature = $payload['signature_key'] ?? '';

        return hash_equals($expectedSignature, $receivedSignature);
    }

    /**
     * Proses notifikasi webhook dari Midtrans dan update status order
     *
     * @param array $payload
     * @return array ['order' => Order, 'status' => string, 'action' => string]
     * @throws \Exception
     */
    public function handleWebhookNotification(array $payload): array
    {
        $orderNumber       = $payload['order_id'] ?? '';
        $transactionStatus = $payload['transaction_status'] ?? '';
        $transactionId     = $payload['transaction_id'] ?? '';
        $paymentType       = $payload['payment_type'] ?? '';
        $grossAmount       = $payload['gross_amount'] ?? 0;
        $fraudStatus       = $payload['fraud_status'] ?? '';

        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        // Tentukan action berdasarkan status
        $action = 'ignored';

        if ($transactionStatus === 'capture') {
            // Credit card: cek fraud status
            if ($fraudStatus === 'accept') {
                $action = 'paid';
            } else {
                $action = 'fraud';
            }
        } elseif ($transactionStatus === 'settlement') {
            $action = 'paid';
        } elseif ($transactionStatus === 'pending') {
            $action = 'pending';
        } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'])) {
            $action = 'failed';
        }

        // Update order status
        $this->applyOrderAction($order, $action, $payload);

        // Simpan ke payment_logs
        $vaNumber = null;
        $bank     = null;

        if (isset($payload['va_numbers'][0])) {
            $vaNumber = $payload['va_numbers'][0]['va_number'] ?? null;
            $bank     = $payload['va_numbers'][0]['bank'] ?? null;
        } elseif (isset($payload['permata_va_number'])) {
            $vaNumber = $payload['permata_va_number'];
            $bank     = 'permata';
        } elseif (isset($payload['bill_key'])) {
            $vaNumber = $payload['bill_key'];
            $bank     = 'mandiri';
        }

        PaymentLog::updateOrCreate(
            ['order_id' => $order->id, 'transaction_id' => $transactionId],
            [
                'order_id_midtrans' => $orderNumber,
                'payment_type'      => $paymentType,
                'status'            => $transactionStatus,
                'amount'            => (float) $grossAmount,
                'va_number'         => $vaNumber,
                'bank'              => $bank,
                'raw_response'      => $payload,
                'paid_at'           => $action === 'paid' ? now() : null,
            ]
        );

        Log::info('Midtrans webhook processed', [
            'order_number' => $orderNumber,
            'transaction_status' => $transactionStatus,
            'action' => $action,
        ]);

        return [
            'order'  => $order,
            'status' => $transactionStatus,
            'action' => $action,
        ];
    }

    /**
     * Apply action ke order sesuai status pembayaran
     */
    private function applyOrderAction(Order $order, string $action, array $payload): void
    {
        match ($action) {
            'paid' => $order->update([
                'status'         => 'paid',
                'payment_status' => 'paid',
                'payment_method' => $this->resolvePaymentMethod($payload),
            ]),
            'pending' => $order->update([
                'status'         => 'pending_payment',
                'payment_status' => 'unpaid',
            ]),
            'failed', 'fraud' => $order->update([
                'status'         => 'cancelled',
                'payment_status' => 'failed',
            ]),
            default => null,
        };
    }

    /**
     * Format nama metode pembayaran yang user-friendly
     */
    private function resolvePaymentMethod(array $payload): string
    {
        $type = $payload['payment_type'] ?? '';
        $bank = $payload['va_numbers'][0]['bank'] ?? ($payload['bank'] ?? '');

        return match ($type) {
            'bank_transfer' => 'Virtual Account ' . strtoupper($bank),
            'gopay'         => 'GoPay',
            'qris'          => 'QRIS',
            'shopeepay'     => 'ShopeePay',
            'cstore'        => 'Gerai Ritel (' . strtoupper($payload['store'] ?? '') . ')',
            'credit_card'   => 'Kartu Kredit/Debit',
            'akulaku'       => 'Akulaku Paylater',
            default         => ucfirst(str_replace('_', ' ', $type)),
        };
    }

    /**
     * Cek status transaksi ke Midtrans API (proactive check)
     * Berguna untuk fallback jika webhook tidak diterima
     *
     * @param string $orderNumber
     * @return array|null
     */
    public function checkTransactionStatus(string $orderNumber): ?array
    {
        $this->configure();

        try {
            $status = \Midtrans\Transaction::status($orderNumber);
            // json_encode + decode untuk konversi deep stdClass → array
            // (array) cast hanya shallow, nested objects tetap stdClass
            return json_decode(json_encode($status), true);
        } catch (\Exception $e) {
            Log::warning('Midtrans checkTransactionStatus failed: ' . $e->getMessage());
            return null;
        }
    }
}
