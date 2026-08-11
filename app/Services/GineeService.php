<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GineeService
{
    protected string $baseUrl;

    protected string $accessKey;

    protected string $secretKey;

    protected string $country;

    public function __construct()
    {
        $this->baseUrl = config('services.ginee.api_url', 'https://api.ginee.com');
        $this->accessKey = config('services.ginee.access_key', '');
        $this->secretKey = config('services.ginee.secret_key', '');
        $this->country = config('services.ginee.country', 'ID');
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
                ->post($this->baseUrl.$uri, [
                    'page' => 0,
                    'size' => 100,
                ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getShops Error: '.$response->status().' - '.$response->body());

            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getShops Exception: '.$e->getMessage());

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
                ->post($this->baseUrl.$uri, [
                    'page' => 0,
                    'size' => 100,
                ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getWarehouses Error: '.$response->status().' - '.$response->body());

            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getWarehouses Exception: '.$e->getMessage());

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
                ->post($this->baseUrl.$uri, [
                    'page' => $page,
                    'size' => $size,
                ]);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getProducts Error: '.$response->status().' - '.$response->body());

            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getProducts Exception: '.$e->getMessage());

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
                ->post($this->baseUrl.$uri, $orderData);

            if ($response->successful()) {
                return $response->json('data');
            }

            Log::error('Ginee API createManualOrder Error: '.$response->status().' - '.$response->body());

            return null;
        } catch (\Exception $e) {
            Log::error('Ginee API createManualOrder Exception: '.$e->getMessage());

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
                ->post($this->baseUrl.$uri, [
                    'orderIds' => [$gineeOrderId],
                ]);

            if ($response->successful()) {
                $orders = $response->json('data') ?? [];

                return $orders[0] ?? null;
            }

            Log::error('Ginee API getOrderDetails Error: '.$response->status().' - '.$response->body());

            return null;
        } catch (\Exception $e) {
            Log::error('Ginee API getOrderDetails Exception: '.$e->getMessage());

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

        if (! empty($variationIds)) {
            $payload['masterVariationIds'] = $variationIds;
        }

        try {
            $response = Http::withHeaders($headers)
                ->timeout(20)
                ->post($this->baseUrl.$uri, $payload);

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }

            Log::error('Ginee API getVariationPrices Error: '.$response->status().' - '.$response->body());

            return [];
        } catch (\Exception $e) {
            Log::error('Ginee API getVariationPrices Exception: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Resolve a local Category id for a raw Ginee product node.
     *
     * Prefers Ginee's own `fullCategoryName` path (e.g. "Women Clothes > Sets
     * > Individual Sets") when present, falling back to keyword matching on
     * the product name for the ~18% of products Ginee doesn't tag.
     */
    public function resolveCategoryId(array $gProduct): ?int
    {
        $path = $gProduct['fullCategoryName'] ?? [];
        $pathStr = is_array($path) ? strtolower(implode(' > ', $path)) : '';
        $name = $gProduct['productName'] ?? ($gProduct['name'] ?? '');

        // "Anak" in the product name is a strong, unambiguous signal.
        // Sellers sometimes file kids' items under Ginee's generic adult
        // "Sets" category by mistake, so this overrides the Ginee tag
        // rather than deferring to it like the other keywords below.
        if (preg_match('/\banak\b/i', $name)) {
            return Category::where('slug', 'setelan-anak')->value('id');
        }

        $slug = null;

        if ($pathStr !== '') {
            if (str_contains($pathStr, 'lingerie') || str_contains($pathStr, 'underwear')) {
                $slug = 'piyama-lingerie';
            } elseif (str_contains($pathStr, 'kids') || str_contains($pathStr, 'baby') || str_contains($pathStr, 'girl clothes') || str_contains($pathStr, 'boy clothes')) {
                $slug = 'setelan-anak';
            } elseif (str_contains($pathStr, 'dress')) {
                $slug = 'dress';
            } elseif (str_contains($pathStr, 'set')) {
                $slug = 'setelan';
            } elseif (str_contains($pathStr, 'top') || str_contains($pathStr, 'blouse') || str_contains($pathStr, 'shirt')) {
                $slug = 'blouse';
            }
        }

        if (! $slug) {
            // Ginee didn't tag this product — fall back to guessing from the name.
            if (preg_match('/\bpiyama\b/i', $name)) {
                $slug = 'piyama-lingerie';
            } elseif (preg_match('/\b(dress|daster|jumpsuit|gamis)\b/i', $name)) {
                $slug = 'dress';
            } elseif (preg_match('/\b(one set|setelan|set rok)\b/i', $name) || preg_match('/\bset\b/i', $name)) {
                $slug = 'setelan';
            } elseif (preg_match('/\batasan\b/i', $name)) {
                $slug = 'blouse';
            }
        }

        if (! $slug) {
            return null;
        }

        return Category::where('slug', $slug)->value('id');
    }

    /**
     * Pull the FULL product catalog from Ginee — paginating through every
     * page, not just the first — and upsert into the local Product /
     * ProductVariant tables. This can process thousands of products, so it
     * is meant to be run from the CLI (Artisan command) for large catalogs;
     * the admin "Tarik Produk Ginee" button also calls this but may hit a
     * web request timeout on very large accounts.
     *
     * @param  int  $pageSize  Products requested per Ginee API page.
     * @param  callable|null  $onProgress  Optional callback(string $stage, int $done, int $total).
     * @return array{imported:int, fetched:int, total:int}
     */
    public function syncAllProducts(int $pageSize = 100, ?callable $onProgress = null): array
    {
        // 1. Paginate through every page of the master product list.
        $page = 0;
        $gineeProductsList = [];
        $total = null;

        do {
            $response = $this->getProducts($page, $pageSize);
            if (empty($response) || ! isset($response['content'])) {
                break;
            }

            $content = $response['content'];
            if ($total === null) {
                $total = $response['total'] ?? count($content);
            }
            if (empty($content)) {
                break;
            }

            $gineeProductsList = array_merge($gineeProductsList, $content);
            if ($onProgress) {
                $onProgress('fetch', count($gineeProductsList), $total);
            }
            $page++;
        } while (count($gineeProductsList) < $total);

        if (empty($gineeProductsList)) {
            return ['imported' => 0, 'fetched' => 0, 'total' => $total ?? 0];
        }

        // 2. Collect every variation ID across every product.
        $allVariationIds = [];
        foreach ($gineeProductsList as $gProduct) {
            foreach ($gProduct['variationBriefs'] ?? [] as $gVar) {
                if (! empty($gVar['id'])) {
                    $allVariationIds[] = $gVar['id'];
                }
            }
        }

        // 3. Fetch prices + variant images in chunks of 20.
        $priceLookup = [];
        if (! empty($allVariationIds)) {
            $chunks = array_chunk($allVariationIds, 20);
            $chunkTotal = count($chunks);
            foreach ($chunks as $i => $chunk) {
                $pricesResp = $this->getVariationPrices($chunk);
                foreach ($pricesResp['content'] ?? [] as $pItem) {
                    if (isset($pItem['variationId'])) {
                        $priceLookup[$pItem['variationId']] = [
                            'price' => isset($pItem['masterPrice']['amount']) ? (float) $pItem['masterPrice']['amount'] : null,
                            'image' => $pItem['image'] ?? null,
                        ];
                    }
                }
                if ($onProgress) {
                    $onProgress('price', $i + 1, $chunkTotal);
                }
            }
        }

        // 4. Upsert products + variants.
        $importedCount = 0;
        foreach ($gineeProductsList as $gProduct) {
            $name = $gProduct['productName'] ?? ($gProduct['name'] ?? null);
            $gProductId = $gProduct['productId'] ?? null;
            if (! $name || ! $gProductId) {
                continue;
            }

            try {
                DB::transaction(function () use ($gProduct, $name, $gProductId, $priceLookup) {
                $sku = $gProduct['sellerSku'] ?? ('GN-'.$gProductId);
                $description = $gProduct['description'] ?? '';
                $weight = $gProduct['weight'] ?? 200;
                $gVariants = $gProduct['variationBriefs'] ?? [];

                $prices = [];
                foreach ($gVariants as $gVar) {
                    if (isset($gVar['id']) && isset($priceLookup[$gVar['id']]['price'])) {
                        $prices[] = $priceLookup[$gVar['id']]['price'];
                    }
                }
                $basePrice = ! empty($prices) ? min($prices) : 0;

                $images = [];
                foreach ($gProduct['images'] ?? [] as $img) {
                    if (is_string($img)) {
                        $images[] = $img;
                    } elseif (is_array($img) && isset($img['url'])) {
                        $images[] = $img['url'];
                    }
                }
                if (empty($images)) {
                    $images = ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60'];
                }

                // Preserve a category the admin already set manually; only
                // auto-resolve it for products that don't have one yet.
                $existing = Product::where('ginee_product_id', $gProductId)->first();
                $categoryId = $existing?->category_id ?? $this->resolveCategoryId($gProduct);

                $product = Product::updateOrCreate(
                    ['ginee_product_id' => $gProductId],
                    [
                        'name' => $name,
                        'slug' => Str::slug($name).'-'.substr($gProductId, -4),
                        'description' => $description,
                        'sku' => $sku,
                        'weight' => $weight,
                        'base_price' => $basePrice,
                        'status' => 'active',
                        'images' => $images,
                        'category_id' => $categoryId,
                    ]
                );

                $importedVariantIds = [];
                foreach ($gVariants as $gVar) {
                    $vSku = $gVar['sku'] ?? ($sku.'-'.($gVar['id'] ?? Str::random(4)));
                    $vName = ! empty($gVar['optionValues']) ? implode(' / ', $gVar['optionValues']) : 'Default';
                    $vPrice = $priceLookup[$gVar['id']]['price'] ?? null;
                    $vStock = $gVar['stock']['availableStock'] ?? ($gVar['stock']['warehouseStock'] ?? 0);
                    $gVariantId = $gVar['id'] ?? null;
                    $vImage = $priceLookup[$gVariantId]['image'] ?? null;

                    $variant = ProductVariant::updateOrCreate(
                        ['product_id' => $product->id, 'sku' => $vSku],
                        [
                            'name' => $vName,
                            'price' => $vPrice,
                            'stock' => $vStock,
                            'ginee_variant_id' => $gVariantId,
                            'image' => $vImage,
                        ]
                    );

                    $importedVariantIds[] = $variant->id;

                    StockLog::create([
                        'product_variant_id' => $variant->id,
                        'before' => 0,
                        'after' => $vStock,
                        'reason' => 'ginee_pull_all_sync',
                    ]);
                }

                ProductVariant::where('product_id', $product->id)
                    ->whereNotIn('id', $importedVariantIds)
                    ->delete();
                });

                $importedCount++;
            } catch (\Throwable $e) {
                // Don't let one bad product (e.g. a data conflict) abort a
                // sync of thousands of products — log it and keep going.
                Log::error('Ginee sync: failed to save product', [
                    'ginee_product_id' => $gProductId,
                    'name' => $name,
                    'error' => $e->getMessage(),
                ]);
            }

            if ($onProgress) {
                $onProgress('save', $importedCount, count($gineeProductsList));
            }
        }

        return ['imported' => $importedCount, 'fetched' => count($gineeProductsList), 'total' => $total];
    }

    /**
     * Format and push a local Order to Ginee OMS
     */
    public function pushOrder(Order $order): ?array
    {
        try {
            // Load items.variant to access the variant SKU (since order_items doesn't have sku)
            $order->load(['items.variant', 'shipping', 'user']);

            $shops = $this->getShops();
            $warehouses = $this->getWarehouses();

            $shopId = $shops['content'][0]['shopId'] ?? ($shops[0]['shopId'] ?? 'sp-mock-1001');
            $warehouseId = $warehouses['content'][0]['id'] ?? ($warehouses[0]['id'] ?? 'wh-mock-1001');

            $gineeOrderItems = $order->items->map(function ($item) use ($warehouseId) {
                return [
                    'sku' => $item->variant->sku ?? '',
                    'quantity' => $item->quantity,
                    'actualPrice' => $item->unit_price,
                    'warehouseId' => $warehouseId,
                ];
            })->toArray();

            $gineePayload = [
                'externalOrderSn' => $order->order_number,
                'shopId' => $shopId,
                'customerName' => $order->shipping?->recipient_name ?? $order->user?->name ?? '',
                'customerEmail' => $order->user?->email ?? '',
                'customerMobile' => $order->shipping?->phone ?? $order->user?->phone ?? '',
                'paymentMethod' => 'PREPAY',
                'payAmount' => $order->total_amount,
                'payAtDatetime' => gmdate('Y-m-d\TH:i:s\Z'),
                'orderItems' => $gineeOrderItems,
                'shippingAddress' => [
                    'name' => $order->shipping?->recipient_name ?? $order->user?->name ?? '',
                    'phoneNumber' => $order->shipping?->phone ?? $order->user?->phone ?? '',
                    'country' => 'ID',
                    'province' => $order->shipping?->province ?? '',
                    'city' => $order->shipping?->city ?? '',
                    'district' => $order->shipping?->city ?? '',
                    'detailAddress' => $order->shipping?->address ?? '',
                ],
                'logisticsInfos' => [
                    [
                        'courierCode' => strtoupper($order->shipping?->courier ?? ''),
                        'shippingMethod' => $order->shipping?->service ?? '',
                        'shippingFee' => $order->shipping_cost,
                    ],
                ],
            ];

            Log::info('Pushing order to Ginee OMS', ['order_number' => $order->order_number, 'payload' => $gineePayload]);
            $gineeResponse = $this->createManualOrder($gineePayload);

            if ($gineeResponse && isset($gineeResponse['gineeOrderId'])) {
                $order->update(['ginee_order_id' => $gineeResponse['gineeOrderId']]);
                Log::info('Order pushed to Ginee successfully', [
                    'order_number' => $order->order_number,
                    'ginee_order_id' => $gineeResponse['gineeOrderId'],
                ]);

                return $gineeResponse;
            } else {
                Log::warning('Ginee push failed', [
                    'order_number' => $order->order_number,
                    'response' => $gineeResponse,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to push order to Ginee: '.$e->getMessage(), [
                'order_number' => $order->order_number,
            ]);
        }

        return null;
    }
}
