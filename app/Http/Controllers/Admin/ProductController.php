<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockLog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

use App\Services\GineeService;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $status = $request->input('status');

        $query = Product::with(['category', 'variants']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Products', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|unique:products,sku',
            'weight' => 'required|integer|min:0',
            'length' => 'nullable|integer|min:0',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'status' => 'required|string|in:active,inactive,out_of_stock',
            'images' => 'nullable|array',
            'variants' => 'required|array|min:1',
            'variants.*.sku' => 'required|string|distinct',
            'variants.*.name' => 'required|string',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.image' => 'nullable|string|max:2048',
        ]);

        DB::transaction(function () use ($validated) {
            // Create Product
            $productData = collect($validated)->except('variants')->toArray();
            $productData['slug'] = Str::slug($validated['name']);
            
            // Check if slug exists and make unique
            $slugCount = Product::where('slug', 'like', $productData['slug'] . '%')->count();
            if ($slugCount > 0) {
                $productData['slug'] .= '-' . ($slugCount + 1);
            }

            // Default image mock-up if empty
            if (empty($productData['images'])) {
                $productData['images'] = ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60'];
            }

            $product = Product::create($productData);

            // Create Variants
            foreach ($validated['variants'] as $vData) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $vData['sku'],
                    'name' => $vData['name'],
                    'price' => $vData['price'] ?? null,
                    'stock' => $vData['stock'],
                    'image' => $vData['image'] ?? null,
                    'ginee_variant_id' => 'gn-var-' . Str::random(8),
                ]);

                // Create Stock Log
                StockLog::create([
                    'product_variant_id' => $variant->id,
                    'before' => 0,
                    'after' => $vData['stock'],
                    'reason' => 'initial_product_creation',
                ]);
            }
        });

        return redirect()->route('admin.products')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'weight' => 'required|integer|min:0',
            'length' => 'nullable|integer|min:0',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'status' => 'required|string|in:active,inactive,out_of_stock',
            'images' => 'nullable|array',
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.sku' => 'required|string|distinct',
            'variants.*.name' => 'required|string',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.image' => 'nullable|string|max:2048',
        ]);

        DB::transaction(function () use ($product, $validated) {
            // Update Product
            $productData = collect($validated)->except('variants')->toArray();
            
            // Re-generate slug if name changed
            if ($product->name !== $validated['name']) {
                $productData['slug'] = Str::slug($validated['name']);
                $slugCount = Product::where('slug', 'like', $productData['slug'] . '%')->where('id', '!=', $product->id)->count();
                if ($slugCount > 0) {
                    $productData['slug'] .= '-' . ($slugCount + 1);
                }
            }

            $product->update($productData);

            // Fetch current variant IDs to track deletions
            $currentVariantIds = $product->variants->pluck('id')->toArray();
            $newVariantIds = [];

            // Update/Create Variants
            foreach ($validated['variants'] as $vData) {
                if (!empty($vData['id'])) {
                    // Update
                    $variant = ProductVariant::find($vData['id']);
                    $oldStock = $variant->stock;
                    
                    $variant->update([
                        'sku' => $vData['sku'],
                        'name' => $vData['name'],
                        'price' => $vData['price'] ?? null,
                        'stock' => $vData['stock'],
                        'image' => $vData['image'] ?? null,
                    ]);

                    $newVariantIds[] = $variant->id;

                    // Log stock change if any
                    if ($oldStock !== (int)$vData['stock']) {
                        StockLog::create([
                            'product_variant_id' => $variant->id,
                            'before' => $oldStock,
                            'after' => $vData['stock'],
                            'reason' => 'manual_edit',
                        ]);
                    }
                } else {
                    // Create New Variant
                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $vData['sku'],
                        'name' => $vData['name'],
                        'price' => $vData['price'] ?? null,
                        'stock' => $vData['stock'],
                        'image' => $vData['image'] ?? null,
                        'ginee_variant_id' => 'gn-var-' . Str::random(8),
                    ]);

                    $newVariantIds[] = $variant->id;

                    StockLog::create([
                        'product_variant_id' => $variant->id,
                        'before' => 0,
                        'after' => $vData['stock'],
                        'reason' => 'new_variant_added',
                    ]);
                }
            }

            // Delete variants that were removed
            $deletedIds = array_diff($currentVariantIds, $newVariantIds);
            if (!empty($deletedIds)) {
                ProductVariant::whereIn('id', $deletedIds)->delete();
            }
        });

        return redirect()->route('admin.products')->with('success', 'Produk berhasil diubah.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return redirect()->route('admin.products')->with('success', 'Produk berhasil dihapus.');
    }

    public function syncGinee(Request $request, Product $product, GineeService $gineeService): RedirectResponse
    {
        $action = $request->input('action', 'push'); // push or pull
        
        if ($action === 'pull' && $product->ginee_product_id) {
            // Fetch products from Ginee to see if we can find this one
            $response = $gineeService->getProducts(0, 100);
            $found = false;
            
            if (isset($response['content'])) {
                foreach ($response['content'] as $gProduct) {
                    if ($gProduct['productId'] == $product->ginee_product_id) {
                        $found = true;
                        
                        $gVariants = $gProduct['variationBriefs'] ?? [];
                        
                        // Fetch prices for these variation IDs
                        $variationIds = [];
                        foreach ($gVariants as $gVar) {
                            if (!empty($gVar['id'])) {
                                $variationIds[] = $gVar['id'];
                            }
                        }
                        
                        $priceLookup = [];  // variationId => ['price' => float, 'image' => string|null]
                        if (!empty($variationIds)) {
                            $pricesResp = $gineeService->getVariationPrices($variationIds);
                            $pricesContent = $pricesResp['content'] ?? [];
                            foreach ($pricesContent as $pItem) {
                                if (isset($pItem['variationId'])) {
                                    $priceLookup[$pItem['variationId']] = [
                                        'price' => isset($pItem['masterPrice']['amount']) ? (float)$pItem['masterPrice']['amount'] : null,
                                        'image' => $pItem['image'] ?? null,
                                    ];
                                }
                            }
                        }
                        
                        DB::transaction(function () use ($product, $gProduct, $gVariants, $priceLookup) {
                            $product->update([
                                'name' => $gProduct['productName'] ?? ($gProduct['name'] ?? $product->name),
                                'description' => $gProduct['description'] ?? $product->description,
                                'weight' => $gProduct['weight'] ?? $product->weight,
                            ]);
                            
                            foreach ($gVariants as $gVar) {
                                if (isset($gVar['sku'])) {
                                    $variant = ProductVariant::where('product_id', $product->id)
                                        ->where('sku', $gVar['sku'])
                                        ->first();
                                        
                                    if ($variant) {
                                        $oldStock = $variant->stock;
                                        $newStock = $gVar['stock']['availableStock'] ?? ($gVar['stock']['warehouseStock'] ?? $variant->stock);
                                        $newPrice = $priceLookup[$gVar['id']]['price'] ?? $variant->price;
                                        $newImage = $priceLookup[$gVar['id']]['image'] ?? $variant->image;
                                        
                                        $variant->update([
                                            'stock' => $newStock,
                                            'price' => $newPrice,
                                            'image' => $newImage,
                                            'ginee_variant_id' => $gVar['id'] ?? $variant->ginee_variant_id,
                                        ]);
                                        
                                        if ($oldStock !== (int)$newStock) {
                                            StockLog::create([
                                                'product_variant_id' => $variant->id,
                                                'before' => $oldStock,
                                                'after' => $variant->stock,
                                                'reason' => 'ginee_pull_single',
                                            ]);
                                        }
                                    }
                                }
                            }
                        });
                        break;
                    }
                }
            }
            
            if (!$found) {
                return redirect()->route('admin.products')->with('error', "Produk dengan Ginee ID {$product->ginee_product_id} tidak ditemukan di Ginee.");
            }
            
            return redirect()->route('admin.products')->with('success', "Data produk {$product->name} berhasil disinkronisasi dari Ginee.");
        }

        // Mock push/fallback sync if not found/pushing
        $product->update([
            'ginee_product_id' => $product->ginee_product_id ?: 'gn-prod-' . rand(100000, 999999),
        ]);

        foreach ($product->variants as $variant) {
            $variant->update([
                'ginee_variant_id' => $variant->ginee_variant_id ?: 'gn-var-' . rand(100000, 999999),
            ]);
        }

        $message = $action === 'push' 
            ? "Produk {$product->name} berhasil di-push ke Ginee (Simulasi)." 
            : "Data produk {$product->name} berhasil disinkronisasi dari Ginee (Simulasi).";

        return redirect()->route('admin.products')->with('success', $message);
    }

    public function syncAllGinee(GineeService $gineeService): RedirectResponse
    {
        $response = $gineeService->getProducts(0, 100);
        
        if (empty($response) || !isset($response['content'])) {
            return redirect()->route('admin.products')->with('error', 'Gagal mengambil data produk dari Ginee Open API. Periksa kembali kredensial Anda.');
        }

        $gineeProductsList = $response['content'];
        $importedCount = 0;

        // 1. Collect all variation IDs across all products
        $allVariationIds = [];
        foreach ($gineeProductsList as $gProduct) {
            $gVariants = $gProduct['variationBriefs'] ?? [];
            foreach ($gVariants as $gVar) {
                if (!empty($gVar['id'])) {
                    $allVariationIds[] = $gVar['id'];
                }
            }
        }

        // 2. Fetch prices AND images in chunks of 20
        // The list-price API returns: variationId, masterPrice.amount, AND image field per variant
        $priceLookup = [];  // variationId => ['price' => float, 'image' => string|null]
        if (!empty($allVariationIds)) {
            $chunks = array_chunk($allVariationIds, 20);
            foreach ($chunks as $chunk) {
                $pricesResp = $gineeService->getVariationPrices($chunk);
                $pricesContent = $pricesResp['content'] ?? [];
                foreach ($pricesContent as $pItem) {
                    if (isset($pItem['variationId'])) {
                        $priceLookup[$pItem['variationId']] = [
                            'price' => isset($pItem['masterPrice']['amount']) ? (float)$pItem['masterPrice']['amount'] : null,
                            'image' => $pItem['image'] ?? null,  // <-- variant photo from Ginee
                        ];
                    }
                }
            }
        }

        // 3. Process products and save to local DB
        DB::transaction(function () use ($gineeProductsList, $priceLookup, &$importedCount) {
            foreach ($gineeProductsList as $gProduct) {
                $name = $gProduct['productName'] ?? ($gProduct['name'] ?? null);
                $gProductId = $gProduct['productId'] ?? null;
                if (!$name || !$gProductId) {
                    continue;
                }

                $sku = $gProduct['sellerSku'] ?? ('GN-' . $gProductId);
                $description = $gProduct['description'] ?? '';
                $weight = $gProduct['weight'] ?? 200;
                
                $gVariants = $gProduct['variationBriefs'] ?? [];
                
                // Determine base price from lookup
                $prices = [];
                foreach ($gVariants as $gVar) {
                    if (isset($gVar['id']) && isset($priceLookup[$gVar['id']]['price'])) {
                        $prices[] = $priceLookup[$gVar['id']]['price'];
                    }
                }
                $basePrice = !empty($prices) ? min($prices) : 0;

                $images = [];
                if (!empty($gProduct['images'])) {
                    foreach ($gProduct['images'] as $img) {
                        // Check if image is a string directly or an array/object with url
                        if (is_string($img)) {
                            $images[] = $img;
                        } elseif (is_array($img) && isset($img['url'])) {
                            $images[] = $img['url'];
                        }
                    }
                }
                if (empty($images)) {
                    $images = ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60'];
                }

                // Create or Update local product
                $product = Product::updateOrCreate(
                    ['ginee_product_id' => $gProductId],
                    [
                        'name' => $name,
                        'slug' => Str::slug($name) . '-' . substr($gProductId, -4),
                        'description' => $description,
                        'sku' => $sku,
                        'weight' => $weight,
                        'base_price' => $basePrice,
                        'status' => 'active',
                        'images' => $images,
                    ]
                );

                $importedVariantIds = [];
                foreach ($gVariants as $gVar) {
                    $vSku = $gVar['sku'] ?? ($sku . '-' . ($gVar['id'] ?? Str::random(4)));
                    $vName = !empty($gVar['optionValues']) ? implode(' / ', $gVar['optionValues']) : 'Default';
                    $vPrice = $priceLookup[$gVar['id']]['price'] ?? null;
                    $vStock = $gVar['stock']['availableStock'] ?? ($gVar['stock']['warehouseStock'] ?? 0);
                    $gVariantId = $gVar['id'] ?? null;

                    // Get variant image from price lookup (list-price API returns `image` field)
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

                    // Log stock change
                    StockLog::create([
                        'product_variant_id' => $variant->id,
                        'before' => 0,
                        'after' => $vStock,
                        'reason' => 'ginee_pull_all_sync',
                    ]);
                }

                // Clean variants removed in Ginee
                ProductVariant::where('product_id', $product->id)
                    ->whereNotIn('id', $importedVariantIds)
                    ->delete();

                $importedCount++;
            }
        });

        return redirect()->route('admin.products')->with('success', "Berhasil menarik & mensinkronisasi {$importedCount} produk dari Ginee.");
    }
}
