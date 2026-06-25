<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RajaOngkirService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = env('RAJAONGKIR_API_URL', 'https://rajaongkir.komerce.id/api/v1');
        $this->apiKey = env('RAJAONGKIR_API_KEY', env('KOMERCE_SHIPPING_KEY', ''));
    }

    /**
     * Get list of provinces
     */
    public function getProvinces(): array
    {
        return Cache::remember('rajaongkir_provinces', 86400, function () {
            try {
                $response = Http::withHeaders([
                    'key' => $this->apiKey,
                    'x-api-key' => $this->apiKey,
                ])->timeout(10)->get($this->baseUrl . '/destination/province');

                if ($response->successful()) {
                    $data = $response->json('data') ?? [];
                    $mapped = [];
                    foreach ($data as $item) {
                        $mapped[] = [
                            'province_id' => (string)($item['id'] ?? ''),
                            'province' => $item['name'] ?? '',
                        ];
                    }
                    return $mapped;
                }
                
                \Log::error('Komerce Provinces Error: ' . $response->body());
                return [];
            } catch (\Exception $e) {
                \Log::error('Komerce Provinces Exception: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get list of cities by province ID
     */
    public function getCitiesByProvince(int $provinceId): array
    {
        $cacheKey = "rajaongkir_cities_prov_{$provinceId}";
        return Cache::remember($cacheKey, 86400, function () use ($provinceId) {
            try {
                $response = Http::withHeaders([
                    'key' => $this->apiKey,
                    'x-api-key' => $this->apiKey,
                ])->timeout(10)->get($this->baseUrl . "/destination/city/{$provinceId}");

                if ($response->successful()) {
                    $data = $response->json('data') ?? [];
                    $mapped = [];
                    foreach ($data as $item) {
                        $mapped[] = [
                            'city_id' => (string)($item['id'] ?? ''),
                            'province_id' => (string)$provinceId,
                            'province' => '',
                            'type' => '',
                            'city_name' => $item['name'] ?? '',
                            'postal_code' => '',
                        ];
                    }
                    return $mapped;
                }
                
                \Log::error("Komerce Cities (Prov ID: $provinceId) Error: " . $response->body());
                return [];
            } catch (\Exception $e) {
                \Log::error('Komerce Cities Exception: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Search destination locations
     */
    public function searchDestination(string $query): array
    {
        try {
            $response = Http::withHeaders([
                'key' => $this->apiKey,
                'x-api-key' => $this->apiKey,
            ])->timeout(10)->get($this->baseUrl . "/destination/domestic-destination", [
                'search' => $query
            ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }
            
            \Log::error("Komerce Search Destination Error: " . $response->body());
            return [];
        } catch (\Exception $e) {
            \Log::error('Komerce Search Destination Exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Calculate Shipping cost
     */
    public function calculateCost(int $origin, int $destination, int $weight, string $courier): array
    {
        $cacheKey = "ongkir_{$origin}_{$destination}_{$weight}_{$courier}";

        return Cache::remember($cacheKey, 600, function () use ($origin, $destination, $weight, $courier) {
            try {
                $response = Http::asForm()->withHeaders([
                    'key' => $this->apiKey,
                    'x-api-key' => $this->apiKey,
                ])->timeout(10)->post($this->baseUrl . '/calculate/domestic-cost', [
                    'origin' => $origin,
                    'destination' => $destination,
                    'weight' => $weight,
                    'courier' => $courier,
                ]);

                if ($response->successful()) {
                    $data = $response->json('data') ?? [];
                    $mapped = [];
                    foreach ($data as $item) {
                        $mapped[] = [
                            'service' => $item['service'] ?? '',
                            'description' => $item['description'] ?? '',
                            'cost' => [
                                [
                                    'value' => (int)($item['cost'] ?? 0),
                                    'etd' => $item['etd'] ?? '',
                                    'note' => '',
                                ]
                            ]
                        ];
                    }
                    return $mapped;
                }
                
                \Log::error('Komerce Cost Error: ' . $response->body());
                return [];
            } catch (\Exception $e) {
                \Log::error('Komerce Cost Exception: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Track package waybill status
     */
    public function trackWaybill(string $waybill, string $courier): array
    {
        try {
            // Komerce API expects form urlencoded payload with 'awb' parameter instead of 'waybill'
            $response = Http::asForm()->withHeaders([
                'key' => $this->apiKey,
                'x-api-key' => $this->apiKey,
            ])->timeout(10)->post($this->baseUrl . '/track/waybill', [
                'awb' => $waybill,
                'courier' => $courier,
            ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }
            
            \Log::error('Komerce Waybill Error: ' . $response->body());

            return [];
        } catch (\Exception $e) {
            \Log::error('Komerce Waybill Exception: ' . $e->getMessage());
            return [];
        }
    }
}
