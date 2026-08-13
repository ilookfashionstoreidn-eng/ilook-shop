<?php

namespace App\Observers;

use App\Models\ProductVariant;

class ProductVariantObserver
{
    /**
     * Handle the ProductVariant "saved" event (fires for both create and
     * update) — recheck the parent product's total stock any time a
     * variant's stock could have changed.
     */
    public function saved(ProductVariant $productVariant): void
    {
        $productVariant->product?->deactivateIfOutOfStock();
    }

    /**
     * Handle the ProductVariant "deleted" event — removing the last
     * in-stock variant can also bring a product's total to zero.
     */
    public function deleted(ProductVariant $productVariant): void
    {
        $productVariant->product?->deactivateIfOutOfStock();
    }
}
