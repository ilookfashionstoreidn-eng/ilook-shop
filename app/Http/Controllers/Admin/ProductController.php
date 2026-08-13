<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockLog;
use App\Services\GineeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

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
            // Top-level categories (Pakaian Wanita, Pakaian Pria, Pakaian
            // Anak) hold no products directly — everything lives on their
            // children (Dress/Blouse/Setelan/...). Match on the category
            // itself plus its children so picking a parent isn't a dead end.
            $category = Category::withCount('children')->find($categoryId);
            if ($category && $category->children_count > 0) {
                $categoryIds = $category->children()->pluck('id')->push($category->id);
                $query->whereIn('category_id', $categoryIds);
            } else {
                $query->where('category_id', $categoryId);
            }
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
            'video_url' => 'nullable|string|max:2048',
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
            $slugCount = Product::where('slug', 'like', $productData['slug'].'%')->count();
            if ($slugCount > 0) {
                $productData['slug'] .= '-'.($slugCount + 1);
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
                    'ginee_variant_id' => 'gn-var-'.Str::random(8),
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

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|unique:products,sku,'.$product->id,
            'weight' => 'required|integer|min:0',
            'length' => 'nullable|integer|min:0',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'status' => 'required|string|in:active,inactive,out_of_stock',
            'images' => 'nullable|array',
            'video_url' => 'nullable|string|max:2048',
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
                $slugCount = Product::where('slug', 'like', $productData['slug'].'%')->where('id', '!=', $product->id)->count();
                if ($slugCount > 0) {
                    $productData['slug'] .= '-'.($slugCount + 1);
                }
            }

            $product->update($productData);

            // Fetch current variant IDs to track deletions
            $currentVariantIds = $product->variants->pluck('id')->toArray();
            $newVariantIds = [];

            // Update/Create Variants
            foreach ($validated['variants'] as $vData) {
                if (! empty($vData['id'])) {
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
                    if ($oldStock !== (int) $vData['stock']) {
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
                        'ginee_variant_id' => 'gn-var-'.Str::random(8),
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
            if (! empty($deletedIds)) {
                ProductVariant::whereIn('id', $deletedIds)->delete();
            }
        });

        return back()->with('success', 'Produk berhasil diubah.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * Flip whether this product is manually featured in the homepage "New
     * Arrivals" grid. `new_arrival_marked_at` is stamped only here (not
     * touched by unrelated edits) so the storefront can order featured
     * picks by "most recently marked" instead of the noisier updated_at.
     */
    public function toggleNewArrival(Product $product): RedirectResponse
    {
        $isNowFeatured = ! $product->is_new_arrival;

        $product->update([
            'is_new_arrival' => $isNowFeatured,
            'new_arrival_marked_at' => $isNowFeatured ? now() : null,
        ]);

        return back()->with(
            'success',
            $isNowFeatured
                ? 'Produk ditambahkan ke New Arrivals.'
                : 'Produk dihapus dari New Arrivals.'
        );
    }

    /**
     * Flip whether this product is manually featured on the storefront
     * /promo page. Same pattern as toggleNewArrival().
     */
    public function togglePromo(Product $product): RedirectResponse
    {
        $isNowPromo = ! $product->is_promo;

        $product->update([
            'is_promo' => $isNowPromo,
            'promo_marked_at' => $isNowPromo ? now() : null,
        ]);

        return back()->with(
            'success',
            $isNowPromo
                ? 'Produk ditambahkan ke halaman Promo.'
                : 'Produk dihapus dari halaman Promo.'
        );
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
                            if (! empty($gVar['id'])) {
                                $variationIds[] = $gVar['id'];
                            }
                        }

                        $priceLookup = [];  // variationId => ['price' => float, 'image' => string|null]
                        if (! empty($variationIds)) {
                            $pricesResp = $gineeService->getVariationPrices($variationIds);
                            $pricesContent = $pricesResp['content'] ?? [];
                            foreach ($pricesContent as $pItem) {
                                if (isset($pItem['variationId'])) {
                                    $priceLookup[$pItem['variationId']] = [
                                        'price' => isset($pItem['masterPrice']['amount']) ? (float) $pItem['masterPrice']['amount'] : null,
                                        'image' => $pItem['image'] ?? null,
                                    ];
                                }
                            }
                        }

                        DB::transaction(function () use ($product, $gProduct, $gVariants, $priceLookup, $gineeService) {
                            $product->update([
                                'name' => $gProduct['productName'] ?? ($gProduct['name'] ?? $product->name),
                                'description' => $gProduct['description'] ?? $product->description,
                                'weight' => $gProduct['weight'] ?? $product->weight,
                                'category_id' => $product->category_id ?? $gineeService->resolveCategoryId($gProduct),
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

                                        if ($oldStock !== (int) $newStock) {
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

            if (! $found) {
                return back()->with('error', "Produk dengan Ginee ID {$product->ginee_product_id} tidak ditemukan di Ginee.");
            }

            return back()->with('success', "Data produk {$product->name} berhasil disinkronisasi dari Ginee.");
        }

        // Mock push/fallback sync if not found/pushing
        $product->update([
            'ginee_product_id' => $product->ginee_product_id ?: 'gn-prod-'.rand(100000, 999999),
        ]);

        foreach ($product->variants as $variant) {
            $variant->update([
                'ginee_variant_id' => $variant->ginee_variant_id ?: 'gn-var-'.rand(100000, 999999),
            ]);
        }

        $message = $action === 'push'
            ? "Produk {$product->name} berhasil di-push ke Ginee (Simulasi)."
            : "Data produk {$product->name} berhasil disinkronisasi dari Ginee (Simulasi).";

        return back()->with('success', $message);
    }

    public function syncAllGinee(GineeService $gineeService): RedirectResponse
    {
        // A large Ginee catalog can take several minutes to fully paginate
        // and sync — don't let PHP's default execution-time limit cut it off.
        set_time_limit(0);

        $result = $gineeService->syncAllProducts();

        if ($result['fetched'] === 0) {
            return back()->with('error', 'Gagal mengambil data produk dari Ginee Open API. Periksa kembali kredensial Anda.');
        }

        return back()->with('success', "Berhasil menarik & mensinkronisasi {$result['imported']} dari {$result['total']} produk di Ginee.");
    }

    public function uploadVideo(Request $request): JsonResponse
    {
        $request->validate([
            'video' => 'required|file|mimes:mp4,mov,avi,mkv,webm|max:20480', // Max 20MB
        ]);

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $filename = 'prod-video-'.time().'-'.Str::random(5).'.'.$file->getClientOriginalExtension();

            $targetDir = public_path('uploads/products/videos');
            if (! file_exists($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            $file->move($targetDir, $filename);
            $filePath = '/uploads/products/videos/'.$filename;

            return response()->json([
                'success' => true,
                'url' => $filePath,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengunggah video.',
        ], 400);
    }
}
