<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flashSale' => function () {
                $isActive = \App\Models\Setting::where('key', 'flash_sale_is_active')->first()->value ?? '0';
                $startTime = \App\Models\Setting::where('key', 'flash_sale_start_time')->first()->value ?? null;
                $endTime = \App\Models\Setting::where('key', 'flash_sale_end_time')->first()->value ?? null;
                
                $products = [];
                if ($isActive === '1') {
                    $products = \App\Models\FlashSaleProduct::with('product.variants', 'product.category')->get()->map(function($fsp) {
                        $product = $fsp->product;
                        if ($product) {
                            $fsPrice = 0;
                            if ($fsp->discount_type === 'percentage') {
                                $fsPrice = max(0, $product->base_price * (1 - ($fsp->discount_value / 100)));
                            } else {
                                $fsPrice = max(0, $product->base_price - $fsp->discount_value);
                            }
                            
                            return [
                                'id' => $product->id,
                                'name' => $product->name,
                                'slug' => $product->slug,
                                'images' => $product->images,
                                'base_price' => $product->base_price,
                                'sale_price' => $product->sale_price,
                                'flash_sale_price' => $fsPrice,
                                'discount_type' => $fsp->discount_type,
                                'discount_value' => $fsp->discount_value,
                                'category_name' => $product->category?->name ?? 'Executive',
                            ];
                        }
                        return null;
                    })->filter()->values();
                }

                return [
                    'is_active' => $isActive === '1',
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'products' => $products,
                ];
            },
        ];
    }
}
