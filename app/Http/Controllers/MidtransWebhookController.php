<?php

namespace App\Http\Controllers;

use App\Services\GineeService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    protected PaymentService $paymentService;
    protected GineeService $gineeService;

    public function __construct(PaymentService $paymentService, GineeService $gineeService)
    {
        $this->paymentService = $paymentService;
        $this->gineeService   = $gineeService;
    }

    /**
     * Handle incoming Midtrans payment notification webhook.
     *
     * Endpoint: POST /api/webhooks/midtrans
     * (dikecualikan dari CSRF via VerifyCsrfToken middleware)
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Midtrans webhook received', [
            'order_id'           => $payload['order_id'] ?? null,
            'transaction_status' => $payload['transaction_status'] ?? null,
            'payment_type'       => $payload['payment_type'] ?? null,
        ]);

        // Validasi signature Midtrans
        if (!$this->paymentService->validateWebhookSignature($payload)) {
            Log::warning('Midtrans webhook: invalid signature', [
                'order_id' => $payload['order_id'] ?? null,
            ]);

            return response()->json(['error' => 'Invalid signature'], 401);
        }

        try {
            $result = $this->paymentService->handleWebhookNotification($payload);
            $order  = $result['order'];
            $action = $result['action'];

            // Jika order berhasil dibayar, push ke Ginee OMS
            if ($action === 'paid' && empty($order->ginee_order_id)) {
                $this->pushOrderToGinee($order, $payload);
            }

            return response()->json([
                'status'  => 'ok',
                'action'  => $action,
                'order'   => $order->order_number,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Midtrans webhook: order not found', [
                'order_id' => $payload['order_id'] ?? null,
            ]);

            // Return 200 agar Midtrans tidak retry terus
            return response()->json(['status' => 'order_not_found'], 200);

        } catch (\Exception $e) {
            Log::error('Midtrans webhook handler error: ' . $e->getMessage(), [
                'payload' => $payload,
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * Push order yang sudah terbayar ke Ginee OMS
     */
    private function pushOrderToGinee(object $order, array $payload): void
    {
        try {
            $order->load(['items', 'shipping']);

            $shops      = $this->gineeService->getShops();
            $warehouses = $this->gineeService->getWarehouses();

            $shopId      = $shops['content'][0]['shopId'] ?? ($shops[0]['shopId'] ?? 'sp-mock-1001');
            $warehouseId = $warehouses['content'][0]['id'] ?? ($warehouses[0]['id'] ?? 'wh-mock-1001');

            $gineeOrderItems = $order->items->map(function ($item) use ($warehouseId) {
                return [
                    'sku'         => $item->sku,
                    'quantity'    => $item->quantity,
                    'actualPrice' => $item->unit_price,
                    'warehouseId' => $warehouseId,
                ];
            })->toArray();

            $gineePayload = [
                'externalOrderSn' => $order->order_number,
                'shopId'          => $shopId,
                'customerName'    => $order->shipping?->recipient_name ?? '',
                'customerEmail'   => $order->user?->email ?? '',
                'customerMobile'  => $order->shipping?->phone ?? '',
                'paymentMethod'   => 'PREPAY',
                'payAmount'       => $order->total_amount,
                'payAtDatetime'   => gmdate('Y-m-d\TH:i:s\Z'),
                'orderItems'      => $gineeOrderItems,
                'shippingAddress' => [
                    'name'          => $order->shipping?->recipient_name ?? '',
                    'phoneNumber'   => $order->shipping?->phone ?? '',
                    'country'       => 'ID',
                    'province'      => $order->shipping?->province ?? '',
                    'city'          => $order->shipping?->city ?? '',
                    'district'      => $order->shipping?->city ?? '',
                    'detailAddress' => $order->shipping?->address ?? '',
                ],
                'logisticsInfos'  => [
                    [
                        'courierCode'    => strtoupper($order->shipping?->courier ?? ''),
                        'shippingMethod' => $order->shipping?->service ?? '',
                        'shippingFee'    => $order->shipping_cost,
                    ],
                ],
            ];

            $gineeResponse = $this->gineeService->createManualOrder($gineePayload);

            if ($gineeResponse && isset($gineeResponse['gineeOrderId'])) {
                $order->update(['ginee_order_id' => $gineeResponse['gineeOrderId']]);
                Log::info('Order pushed to Ginee via webhook', [
                    'order_number'   => $order->order_number,
                    'ginee_order_id' => $gineeResponse['gineeOrderId'],
                ]);
            } else {
                Log::warning('Ginee push failed after payment', [
                    'order_number' => $order->order_number,
                    'response'     => $gineeResponse,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to push paid order to Ginee: ' . $e->getMessage(), [
                'order_number' => $order->order_number,
            ]);
            // Jangan throw — Ginee error tidak boleh mengganggu response webhook ke Midtrans
        }
    }
}
