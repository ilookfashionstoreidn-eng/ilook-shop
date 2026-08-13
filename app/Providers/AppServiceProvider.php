<?php

namespace App\Providers;

use App\Models\ProductVariant;
use App\Observers\ProductVariantObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Auto-deactivate a product once every variant's stock hits 0 —
        // applies regardless of which code path changed the stock (Ginee
        // sync, admin product edit, /admin/stocks adjustment, order
        // placement decrement).
        ProductVariant::observe(ProductVariantObserver::class);
    }
}
