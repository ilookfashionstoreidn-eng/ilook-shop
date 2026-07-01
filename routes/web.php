<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\FlashSaleController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\BankAccountController;
use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\GineeWebhookController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Storefront Routes
Route::get('/', [StorefrontController::class, 'home'])->name('storefront.home');
Route::get('/product/{slug}', [StorefrontController::class, 'productDetail'])->name('storefront.product');
Route::get('/cart', [StorefrontController::class, 'cart'])->name('storefront.cart');
Route::get('/checkout', [StorefrontController::class, 'checkoutPage'])->name('storefront.checkout');
Route::post('/checkout', [StorefrontController::class, 'placeOrder'])->name('storefront.checkout.store');
Route::get('/order/{order}/success', [StorefrontController::class, 'orderSuccess'])->name('storefront.order.success');
Route::get('/order/{order}/pending', [StorefrontController::class, 'orderPending'])->name('storefront.order.pending');
Route::post('/orders/{order}/payment/initiate', [StorefrontController::class, 'initiatePayment'])->name('storefront.payment.initiate');
Route::get('/orders/{order}/payment/status', [StorefrontController::class, 'checkPaymentStatus'])->name('storefront.payment.status');
Route::post('/api/shipping/cost', [StorefrontController::class, 'calculateShipping']);
Route::get('/api/shipping/cities/{province}', [StorefrontController::class, 'getCities']);
Route::get('/api/shipping/search-destination', [StorefrontController::class, 'searchDestination']);
Route::post('/api/coupon/apply', [StorefrontController::class, 'applyCoupon'])->name('storefront.coupon.apply');

// Midtrans & Ginee Webhooks — dikecualikan dari CSRF di bootstrap/app.php
Route::post('/api/webhooks/midtrans', [MidtransWebhookController::class, 'handle'])->name('webhooks.midtrans');
Route::post('/api/webhooks/ginee', [GineeWebhookController::class, 'handle'])->name('webhooks.ginee');

// Pesanan Saya — harus login
Route::middleware('auth')->group(function () {
    Route::get('/my-orders', [StorefrontController::class, 'myOrders'])->name('storefront.my-orders');
    Route::get('/my-orders/{order}', [StorefrontController::class, 'orderDetail'])->name('storefront.order.detail');
    Route::get('/my-orders/{order}/tracking', [StorefrontController::class, 'trackOrder'])->name('storefront.order.tracking');
    Route::post('/my-orders/{order}/payment-proof', [StorefrontController::class, 'uploadPaymentProof'])->name('storefront.order.payment-proof');
    
    // Alur Force Input Nomor HP
    Route::get('/enter-phone', [\App\Http\Controllers\Auth\PhoneEntryController::class, 'show'])->name('phone.entry');
    Route::post('/enter-phone', [\App\Http\Controllers\Auth\PhoneEntryController::class, 'store'])->name('phone.store');

    // System Chat APIs
    Route::get('/api/chats/messages', [\App\Http\Controllers\ChatMessageController::class, 'getMessages']);
    Route::post('/api/chats/messages', [\App\Http\Controllers\ChatMessageController::class, 'sendMessage']);
    Route::post('/api/chats/read', [\App\Http\Controllers\ChatMessageController::class, 'markAsRead']);
});

Route::get('/dashboard', function () {
    if (auth()->user() && auth()->user()->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('storefront.home');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Panel routes protected by Auth and Admin middleware
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    
    // Products CRUD
    Route::get('/products', [ProductController::class, 'index'])->name('products');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::post('/products/upload-video', [ProductController::class, 'uploadVideo'])->name('products.upload-video');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/{product}/sync-ginee', [ProductController::class, 'syncGinee'])->name('products.sync-ginee');
    Route::post('/products/sync-all-ginee', [ProductController::class, 'syncAllGinee'])->name('products.sync-all-ginee');

    // Categories CRUD
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Stocks
    Route::get('/stocks', [StockController::class, 'index'])->name('stocks');
    Route::put('/stocks/{variant}', [StockController::class, 'update'])->name('stocks.update');

    // Orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::put('/orders/{order}/resi', [OrderController::class, 'updateResi'])->name('orders.update-resi');
    Route::post('/orders/{order}/sync-ginee', [OrderController::class, 'syncGinee'])->name('orders.sync-ginee');
    Route::get('/orders/{order}/invoice', [OrderController::class, 'showInvoice'])->name('orders.invoice');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

    // Users CRUD
    Route::get('/users', [UserController::class, 'index'])->name('users');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Reviews CRUD
    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Flash Sale Management
    Route::get('/flash-sales', [FlashSaleController::class, 'index'])->name('flash-sales');
    Route::post('/flash-sales', [FlashSaleController::class, 'store'])->name('flash-sales.store');
    Route::put('/flash-sales/{flashSaleProduct}', [FlashSaleController::class, 'update'])->name('flash-sales.update');
    Route::delete('/flash-sales/{flashSaleProduct}', [FlashSaleController::class, 'destroy'])->name('flash-sales.destroy');
    Route::post('/flash-sales/settings', [FlashSaleController::class, 'updateSettings'])->name('flash-sales.settings.update');

    // Coupons CRUD
    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    // Payments CRUD
    Route::get('/payments', [BankAccountController::class, 'index'])->name('payments');
    Route::post('/payments', [BankAccountController::class, 'store'])->name('payments.store');
    Route::put('/payments/{bankAccount}', [BankAccountController::class, 'update'])->name('payments.update');
    Route::delete('/payments/{bankAccount}', [BankAccountController::class, 'destroy'])->name('payments.destroy');

    // Admin Chats
    Route::get('/chats', [\App\Http\Controllers\Admin\ChatController::class, 'index'])->name('chats');
    Route::get('/api/chats/users', [\App\Http\Controllers\ChatMessageController::class, 'getChatUsers']);
});

Route::get('/test-ongkir', function () {
    $service = new \App\Services\RajaOngkirService();
    $provinces = $service->getProvinces();
    return response()->json([
        'api_url' => env('RAJAONGKIR_API_URL'),
        'total_provinces' => count($provinces),
        'sample' => array_slice($provinces, 0, 5)
    ]);
});

require __DIR__.'/auth.php';

