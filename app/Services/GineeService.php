<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GineeService
{
    protected string $baseUrl;
    protected string $accessKey;
    protected string $secretKey;
    protected string $country;

    public function __construct()
    {
        $this->baseUrl = env('GINEE_API_URL', 'https://api.ginee.com');
        $this->accessKey = env('GINEE_ACCESS_KEY', '');
        $this->secretKey = env('GINEE_SECRET_KEY', '');
        $this->country = env('GINEE_COUNTRY', 'ID');
    }

    /**
     * Generate HMAC-SHA256 signature and get headers
     */
    private function getHeaders(string $method, string $uri): array
    {
        $stringToSign = "{$method}\${$uri}\$";
        $signature = base64_encode(hash_hmac('sha256', $stringToSign, $this->secretKey, true));

        return [
            'Content-Type' => 'application/json',
            'X-Advai-Country' => $this->country,
            'Authorization' => "{$this->accessKey}:{$signature}",
        ];
    }

    /**
     * Get manual shops list
     */
    public function getShops(): array
    {
        $uri = '/openapi/shop/v1/list';
        $headers = $this->getHeaders('POST', $uri);

        try {
            $response = Http::withHeaders($headers)
                ->timeout(15)
                ->post($this->baseUrl . $uri, [
                    'page' => 0,
                    'size' => 100
                ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getShops Error: ' . $response->status() . ' - ' . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getShops Exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get warehouses list
     */
    public function getWarehouses(): array
    {
        $uri = '/openapi/warehouse/v1/search';
        $headers = $this->getHeaders('POST', $uri);

        try {
            $response = Http::withHeaders($headers)
                ->timeout(15)
                ->post($this->baseUrl . $uri, [
                    'page' => 0,
                    'size' => 100
                ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getWarehouses Error: ' . $response->status() . ' - ' . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getWarehouses Exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get master products list
     */
    public function getProducts(int $page = 0, int $size = 100): array
    {
        $uri = '/openapi/product/master/v1/list';
        $headers = $this->getHeaders('POST', $uri);

        try {
            $response = Http::withHeaders($headers)
                ->timeout(20)
                ->post($this->baseUrl . $uri, [
                    'page' => $page,
                    'size' => $size
                ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getProducts Error: ' . $response->status() . ' - ' . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getProducts Exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Push manual order to Ginee
     */
    public function createManualOrder(array $orderData): ?array
    {
        $uri = '/openapi/order/v1/create-manual-order';
        $headers = $this->getHeaders('POST', $uri);

        try {
            $response = Http::withHeaders($headers)
                ->timeout(20)
                ->post($this->baseUrl . $uri, $orderData);

            if ($response->successful()) {
                return $response->json('data');
            }

            Log::error('Ginee API createManualOrder Error: ' . $response->status() . ' - ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Ginee API createManualOrder Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get order details by Ginee Order ID
     */
    public function getOrderDetails(string $gineeOrderId): ?array
    {
        $uri = '/openapi/order/v1/batch-get';
        $headers = $this->getHeaders('POST', $uri);

        try {
            $response = Http::withHeaders($headers)
                ->timeout(15)
                ->post($this->baseUrl . $uri, [
                    'orderIds' => [$gineeOrderId]
                ]);

            if ($response->successful()) {
                $orders = $response->json('data') ?? [];
                return $orders[0] ?? null;
            }

            Log::error('Ginee API getOrderDetails Error: ' . $response->status() . ' - ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Ginee API getOrderDetails Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get master variation prices list
     */
    public function getVariationPrices(array $variationIds = [], int $page = 0, int $size = 100): array
    {
        $uri = '/openapi/product/variation/v1/list-price';
        $headers = $this->getHeaders('POST', $uri);

        $payload = [
            'page' => $page,
            'size' => $size,
        ];

        if (!empty($variationIds)) {
            $payload['masterVariationIds'] = $variationIds;
        }

        try {
            $response = Http::withHeaders($headers)
                ->timeout(20)
                ->post($this->baseUrl . $uri, $payload);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getVariationPrices Error: ' . $response->status() . ' - ' . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getVariationPrices Exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Format and push a local Order to Ginee OMS
     */
    public function pushOrder(\App\Models\Order $order): ?array
    {
        try {
            // Load items.variant to access the variant SKU (since order_items doesn't have sku)
            $order->load(['items.variant', 'shipping', 'user']);

            $shops      = $this->getShops();
            $warehouses = $this->getWarehouses();

            $shopId      = $shops['content'][0]['shopId'] ?? ($shops[0]['shopId'] ?? 'sp-mock-1001');
            $warehouseId = $warehouses['content'][0]['id'] ?? ($warehouses[0]['id'] ?? 'wh-mock-1001');

            $gineeOrderItems = $order->items->map(function ($item) use ($warehouseId) {
                return [
                    'sku'         => $item->variant->sku ?? '',
                    'quantity'    => $item->quantity,
                    'actualPrice' => $item->unit_price,
                    'warehouseId' => $warehouseId,
                ];
            })->toArray();

            $gineePayload = [
                'externalOrderSn' => $order->order_number,
                'shopId'          => $shopId,
                'customerName'    => $order->shipping?->recipient_name ?? $order->user?->name ?? '',
                'customerEmail'   => $order->user?->email ?? '',
                'customerMobile'  => $order->shipping?->phone ?? $order->user?->phone ?? '',
                'paymentMethod'   => 'PREPAY',
                'payAmount'       => $order->total_amount,
                'payAtDatetime'   => gmdate('Y-m-d\TH:i:s\Z'),
                'orderItems'      => $gineeOrderItems,
                'shippingAddress' => [
                    'name'          => $order->shipping?->recipient_name ?? $order->user?->name ?? '',
                    'phoneNumber'   => $order->shipping?->phone ?? $order->user?->phone ?? '',
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

            Log::info('Pushing order to Ginee OMS', ['order_number' => $order->order_number, 'payload' => $gineePayload]);
            $gineeResponse = $this->createManualOrder($gineePayload);

            if ($gineeResponse && isset($gineeResponse['gineeOrderId'])) {
                $order->update(['ginee_order_id' => $gineeResponse['gineeOrderId']]);
                Log::info('Order pushed to Ginee successfully', [
                    'order_number'   => $order->order_number,
                    'ginee_order_id' => $gineeResponse['gineeOrderId'],
                ]);
                return $gineeResponse;
            } else {
                Log::warning('Ginee push failed', [
                    'order_number' => $order->order_number,
                    'response'     => $gineeResponse,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to push order to Ginee: ' . $e->getMessage(), [
                'order_number' => $order->order_number,
            ]);
        }
        return null;
    }
}
