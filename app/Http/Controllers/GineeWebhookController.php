<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class GineeWebhookController extends Controller
{
    /**
     * Handle incoming webhook notification from Ginee OMS
     */
    public function handle(Request $request): JsonResponse
    {
        Log::info('Ginee Webhook Received', $request->all());

        $data = $request->json()->all();
        
        $payload = $data['payload'] ?? [];
        if (empty($payload)) {
            return response()->json(['success' => false, 'message' => 'Empty payload.'], 400);
        }

        // Get Order identifiers from payload
        $gineeOrderId = $payload['orderId'] ?? $payload['gineeOrderId'] ?? null;
        $channelOrderId = $payload['channelOrderId'] ?? $payload['externalOrderSn'] ?? $payload['orderSn'] ?? null;

        // Find the order in our local database
        $order = null;
        if ($gineeOrderId) {
            $order = Order::where('ginee_order_id', $gineeOrderId)->first();
        }
        if (!$order && $channelOrderId) {
            $order = Order::where('order_number', $channelOrderId)->first();
        }

        if (!$order) {
            Log::warning('Ginee Webhook: Order not found locally', [
                'gineeOrderId' => $gineeOrderId,
                'channelOrderId' => $channelOrderId
            ]);
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        // Try to get tracking details
        $trackingNumber = $payload['logistics']['trackingNo'] ?? $payload['logistics']['trackingNumber'] ?? $payload['trackingNumber'] ?? $payload['airwayBill'] ?? null;
        $courier = $payload['logistics']['provider'] ?? $payload['logistics']['courierCode'] ?? $payload['courierCode'] ?? null;
        $gineeStatus = $payload['status'] ?? null;

        DB::transaction(function () use ($order, $trackingNumber, $courier, $gineeStatus, $gineeOrderId) {
            $shipping = $order->shipping;
            
            $updated = false;
            
            // Save Ginee Order ID if not already saved
            if ($gineeOrderId && $order->ginee_order_id !== $gineeOrderId) {
                $order->update(['ginee_order_id' => $gineeOrderId]);
            }

            // Update tracking number if present
            if ($trackingNumber && $shipping) {
                $shipping->update([
                    'tracking_number' => $trackingNumber,
                    'courier' => $courier ?? $shipping->courier,
                    'courier_name' => strtoupper($courier ?? $shipping->courier ?? ''),
                ]);
                $updated = true;
            }

            // Update order status if shipped
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
                // If tracking number was added, default status to shipped
                $order->update([
                    'status' => 'shipped',
                    'payment_status' => 'paid',
                ]);
                $updated = true;
            }

            if ($updated) {
                Log::info('Ginee Webhook: Order updated successfully', [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'tracking_number' => $trackingNumber,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Webhook processed.'
        ]);
    }
}
