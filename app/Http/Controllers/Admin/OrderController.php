<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\StockLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status'); // filter by status

        $query = Order::with(['user', 'items.variant.product', 'shipping', 'bankAccount']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('shipping', function ($sq) use ($search) {
                      $sq->where('recipient_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending_payment,paid,processing,shipped,delivered,cancelled,returned',
            'payment_status' => 'nullable|string|in:unpaid,paid,failed,expired',
        ]);

        DB::transaction(function () use ($order, $validated) {
            $oldStatus = $order->status;
            $newStatus = $validated['status'];

            $updateData = ['status' => $newStatus];
            if (!empty($validated['payment_status'])) {
                $updateData['payment_status'] = $validated['payment_status'];
            }

            $order->update($updateData);

            // If order cancelled, return the stock!
            if ($newStatus === 'cancelled' && in_array($oldStatus, ['paid', 'processing', 'shipped'])) {
                foreach ($order->items as $item) {
                    $variant = $item->variant;
                    if ($variant) {
                        $before = $variant->stock;
                        $after = $before + $item->quantity;
                        $variant->update(['stock' => $after]);

                        StockLog::create([
                            'product_variant_id' => $variant->id,
                            'before' => $before,
                            'after' => $after,
                            'reason' => "order_cancelled_return_stock: {$order->order_number}",
                        ]);
                    }
                }
            }
        });

        $order->refresh();
        // If paid or processing and not pushed to Ginee yet, push to Ginee OMS
        if (in_array($order->status, ['paid', 'processing']) && empty($order->ginee_order_id)) {
            try {
                $gineeService = app(\App\Services\GineeService::class);
                $gineeService->pushOrder($order);
            } catch (\Exception $e) {
                \Log::error('Admin update status Ginee push error: ' . $e->getMessage());
            }
        }

        return redirect()->route('admin.orders')->with('success', "Status pesanan {$order->order_number} berhasil diubah.");
    }

    public function updateResi(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'tracking_number' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($order, $validated) {
            $shipping = $order->shipping;
            if ($shipping) {
                $shipping->update([
                    'tracking_number' => $validated['tracking_number'],
                ]);
            }

            // Automate update status to 'shipped' and 'paid'
            $order->update([
                'status' => 'shipped',
                'payment_status' => 'paid',
            ]);
        });

        return redirect()->route('admin.orders')->with('success', "Nomor resi untuk pesanan {$order->order_number} berhasil disimpan.");
    }

    /**
     * Synchronize order status and waybill from Ginee OMS
     */
    public function syncGinee(Order $order): RedirectResponse
    {
        $gineeService = app(\App\Services\GineeService::class);
        $order->load('shipping');

        $gineeOrderId = $order->ginee_order_id;
        $gineeOrder = null;

        // 1. Try to fetch by Ginee Order ID if we have it
        if ($gineeOrderId) {
            $gineeOrder = $gineeService->getOrderDetails($gineeOrderId);
        }

        // 2. Fallback: Search Ginee by channelOrderId (using our local order_number)
        if (!$gineeOrder) {
            try {
                $shops = $gineeService->getShops();
                $shopId = null;
                
                // Get manual channel shop ID
                $shopsContent = $shops['content'] ?? $shops ?? [];
                foreach ($shopsContent as $shop) {
                    if (($shop['channel'] ?? '') === 'MANUAL') {
                        $shopId = $shop['shopId'];
                        break;
                    }
                }
                
                if ($shopId) {
                    $uri = '/openapi/order/v1/batch-get';
                    $accessKey = env('GINEE_ACCESS_KEY');
                    $secretKey = env('GINEE_SECRET_KEY');
                    $baseUrl = env('GINEE_API_URL');
                    $country = env('GINEE_COUNTRY', 'ID');
                    
                    $stringToSign = "POST\${$uri}\$";
                    $signature = base64_encode(hash_hmac('sha256', $stringToSign, $secretKey, true));
                    
                    $response = \Illuminate\Support\Facades\Http::withHeaders([
                        'Content-Type' => 'application/json',
                        'X-Advai-Country' => $country,
                        'Authorization' => "{$accessKey}:{$signature}",
                    ])->timeout(15)->post($baseUrl . $uri, [
                        'shopId' => $shopId,
                        'channelOrderIds' => [$order->order_number]
                    ]);
                    
                    if ($response->successful()) {
                        $ordersList = $response->json('data') ?? [];
                        $gineeOrder = $ordersList[0] ?? null;
                    }
                }
            } catch (\Exception $e) {
                \Log::error('syncGinee fallback fetch exception: ' . $e->getMessage());
            }
        }

        if (!$gineeOrder) {
            return redirect()->route('admin.orders')->with('error', "Pesanan {$order->order_number} tidak ditemukan di sistem Ginee.");
        }

        // Extract tracking and status
        $trackingNumber = null;
        $courier = null;
        $gineeStatus = $gineeOrder['status'] ?? null;
        $gineeOrderIdReal = $gineeOrder['gineeOrderId'] ?? null;

        $logistics = $gineeOrder['logisticsInfos'] ?? $gineeOrder['logistics'] ?? [];
        if (!empty($logistics)) {
            if (isset($logistics[0])) {
                $trackingNumber = $logistics[0]['trackingNo'] ?? $logistics[0]['trackingNumber'] ?? $logistics[0]['airwayBill'] ?? null;
                $courier = $logistics[0]['courierCode'] ?? $logistics[0]['provider'] ?? null;
            } else {
                $trackingNumber = $logistics['trackingNo'] ?? $logistics['trackingNumber'] ?? $logistics['airwayBill'] ?? null;
                $courier = $logistics['courierCode'] ?? $logistics['provider'] ?? null;
            }
        }

        if (!$trackingNumber) {
            $trackingNumber = $gineeOrder['trackingNo'] ?? $gineeOrder['trackingNumber'] ?? $gineeOrder['airwayBillNo'] ?? null;
        }
        if (!$courier) {
            $courier = $gineeOrder['courierCode'] ?? $gineeOrder['courier'] ?? null;
        }

        $updated = false;

        DB::transaction(function () use ($order, $trackingNumber, $courier, $gineeStatus, $gineeOrderIdReal, &$updated) {
            $shipping = $order->shipping;

            if ($gineeOrderIdReal && $order->ginee_order_id !== $gineeOrderIdReal) {
                $order->update(['ginee_order_id' => $gineeOrderIdReal]);
                $updated = true;
            }

            if ($trackingNumber && $shipping) {
                if ($shipping->tracking_number !== $trackingNumber || strtolower($shipping->courier) !== strtolower($courier)) {
                    $shipping->update([
                        'tracking_number' => $trackingNumber,
                        'courier' => $courier ?? $shipping->courier,
                        'courier_name' => strtoupper($courier ?? $shipping->courier ?? ''),
                    ]);
                    $updated = true;
                }
            }

            if ($gineeStatus) {
                $statusMap = [
                    'SHIPPED' => 'shipped',
                    'DELIVERED' => 'delivered',
                    'COMPLETED' => 'completed',
                    'CANCELLED' => 'cancelled',
                    'CANCEL' => 'cancelled',
                ];
                
                $newStatus = $statusMap[strtoupper($gineeStatus)] ?? null;
                if ($newStatus && $order->status !== $newStatus) {
                    $order->update([
                        'status' => $newStatus,
                        'payment_status' => ($newStatus === 'cancelled') ? 'failed' : 'paid',
                    ]);
                    $updated = true;
                }
            } elseif ($trackingNumber && !in_array($order->status, ['shipped', 'delivered', 'completed'])) {
                $order->update([
                    'status' => 'shipped',
                    'payment_status' => 'paid',
                ]);
                $updated = true;
            }
        });

        if ($updated) {
            return redirect()->route('admin.orders')->with('success', "Status dan resi pesanan {$order->order_number} berhasil disinkronkan dengan Ginee.");
        }

        return redirect()->route('admin.orders')->with('info', "Data pesanan {$order->order_number} di Ginee sudah sinkron (tidak ada perubahan).");
    }

    public function showInvoice(Order $order): Response
    {
        $order->load(['user', 'items.variant.product', 'shipping']);
        return Inertia::render('Admin/Invoice', [
            'order' => $order,
        ]);
    }
}
