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
                $this->gineeService->pushOrder($order);
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
}
