<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    protected $with = ['flashSale'];

    protected $appends = ['is_flash_sale_active', 'flash_sale_price'];

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'sku',
        'weight',
        'length',
        'width',
        'height',
        'base_price',
        'sale_price',
        'status',
        'ginee_product_id',
        'images',
        'video_url',
        'is_new_arrival',
        'new_arrival_marked_at',
    ];

    protected $casts = [
        'images' => 'array',
        'base_price' => 'float',
        'sale_price' => 'float',
        'is_new_arrival' => 'boolean',
        'new_arrival_marked_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function flashSale(): HasOne
    {
        return $this->hasOne(FlashSaleProduct::class);
    }

    public function getIsFlashSaleActiveAttribute(): bool
    {
        $isActive = Setting::where('key', 'flash_sale_is_active')->first()->value ?? '0';
        if ($isActive !== '1') {
            return false;
        }

        $startTime = Setting::where('key', 'flash_sale_start_time')->first()->value ?? null;
        $endTime = Setting::where('key', 'flash_sale_end_time')->first()->value ?? null;
        $now = now();

        if ($startTime && $now->lt(Carbon::parse($startTime, 'Asia/Jakarta'))) {
            return false;
        }
        if ($endTime && $now->gt(Carbon::parse($endTime, 'Asia/Jakarta'))) {
            return false;
        }

        return $this->flashSale()->exists();
    }

    public function getFlashSalePriceAttribute(): ?float
    {
        if (! $this->is_flash_sale_active) {
            return null;
        }

        $flashSale = $this->flashSale;
        if (! $flashSale) {
            return null;
        }

        if ($flashSale->discount_type === 'percentage') {
            return max(0, $this->base_price * (1 - ($flashSale->discount_value / 100)));
        }

        return max(0, $this->base_price - $flashSale->discount_value);
    }

    public function getVariantFlashSalePrice($variant): ?float
    {
        if (! $this->is_flash_sale_active) {
            return null;
        }

        $flashSale = $this->flashSale;
        if (! $flashSale) {
            return null;
        }

        $originalPrice = $variant->price ?? $this->base_price;
        if ($flashSale->discount_type === 'percentage') {
            return max(0, $originalPrice * (1 - ($flashSale->discount_value / 100)));
        }

        return max(0, $originalPrice - $flashSale->discount_value);
    }
}
