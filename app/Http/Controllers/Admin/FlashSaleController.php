<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\FlashSaleProduct;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FlashSaleController extends Controller
{
    public function index(Request $request): Response
    {
        // Get global configurations
        $settingsRaw = Setting::whereIn('key', [
            'flash_sale_is_active',
            'flash_sale_start_time',
            'flash_sale_end_time'
        ])->pluck('value', 'key')->toArray();

        $settings = [
            'flash_sale_is_active' => isset($settingsRaw['flash_sale_is_active']) ? ($settingsRaw['flash_sale_is_active'] === '1') : false,
            'flash_sale_start_time' => $settingsRaw['flash_sale_start_time'] ?? '',
            'flash_sale_end_time' => $settingsRaw['flash_sale_end_time'] ?? '',
        ];

        // Fetch products in flash sale
        $flashSaleProducts = FlashSaleProduct::with(['product.variants', 'product.category'])->get();

        // Fetch all active products for the selection dropdown
        $availableProducts = Product::where('status', 'active')
            ->whereDoesntHave('flashSale')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/FlashSales', [
            'flashSaleProducts' => $flashSaleProducts,
            'availableProducts' => $availableProducts,
            'settings' => $settings,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id|unique:flash_sale_products,product_id',
            'discount_type' => 'required|string|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
        ]);

        if ($validated['discount_type'] === 'percentage' && $validated['discount_value'] > 100) {
            return back()->withErrors(['discount_value' => 'Persentase diskon tidak boleh melebihi 100%.']);
        }

        FlashSaleProduct::create($validated);

        return redirect()->route('admin.flash-sales')->with('success', 'Produk berhasil ditambahkan ke Flash Sale.');
    }

    public function update(Request $request, FlashSaleProduct $flashSaleProduct): RedirectResponse
    {
        $validated = $request->validate([
            'discount_type' => 'required|string|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
        ]);

        if ($validated['discount_type'] === 'percentage' && $validated['discount_value'] > 100) {
            return back()->withErrors(['discount_value' => 'Persentase diskon tidak boleh melebihi 100%.']);
        }

        $flashSaleProduct->update($validated);

        return redirect()->route('admin.flash-sales')->with('success', 'Detail diskon produk berhasil diperbarui.');
    }

    public function destroy(FlashSaleProduct $flashSaleProduct): RedirectResponse
    {
        $flashSaleProduct->delete();

        return redirect()->route('admin.flash-sales')->with('success', 'Produk berhasil dihapus dari Flash Sale.');
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'flash_sale_is_active' => 'required|boolean',
            'flash_sale_start_time' => 'nullable|string',
            'flash_sale_end_time' => 'nullable|string',
        ]);

        Setting::updateOrCreate(
            ['key' => 'flash_sale_is_active'],
            ['value' => $validated['flash_sale_is_active'] ? '1' : '0']
        );

        Setting::updateOrCreate(
            ['key' => 'flash_sale_start_time'],
            ['value' => $validated['flash_sale_start_time'] ?: null]
        );

        Setting::updateOrCreate(
            ['key' => 'flash_sale_end_time'],
            ['value' => $validated['flash_sale_end_time'] ?: null]
        );

        return redirect()->route('admin.flash-sales')->with('success', 'Pengaturan global Flash Sale berhasil diperbarui.');
    }
}
