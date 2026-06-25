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
}
