<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin coupon CRUD operations.
     */
    public function test_admin_can_manage_coupons(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // 1. Create Coupon
        $response = $this->actingAs($admin)->post(route('admin.coupons.store'), [
            'code' => 'testpromo',
            'type' => 'percentage',
            'value' => 10,
            'min_spend' => 50000,
            'is_active' => true,
            'expires_at' => Carbon::now()->addDays(5)->toDateTimeString(),
        ]);

        $response->assertRedirect(route('admin.coupons'));
        $this->assertDatabaseHas('coupons', [
            'code' => 'TESTPROMO', // should be uppercase
            'type' => 'percentage',
            'value' => 10.00,
            'min_spend' => 50000.00,
        ]);

        $coupon = Coupon::where('code', 'TESTPROMO')->first();

        // 2. Update Coupon
        $response = $this->actingAs($admin)->put(route('admin.coupons.update', $coupon->id), [
            'code' => 'testpromo_updated',
            'type' => 'fixed',
            'value' => 20000,
            'min_spend' => 60000,
            'is_active' => false,
            'expires_at' => null,
        ]);

        $response->assertRedirect(route('admin.coupons'));
        $this->assertDatabaseHas('coupons', [
            'id' => $coupon->id,
            'code' => 'TESTPROMO_UPDATED',
            'type' => 'fixed',
            'value' => 20000.00,
            'is_active' => false,
        ]);

        // 3. Delete Coupon
        $response = $this->actingAs($admin)->delete(route('admin.coupons.destroy', $coupon->id));
        $response->assertRedirect(route('admin.coupons'));
        $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
    }

    /**
     * Test coupon apply API.
     */
    public function test_coupon_apply_validations(): void
    {
        $couponPercent = Coupon::create([
            'code' => 'DISCOUNT20',
            'type' => 'percentage',
            'value' => 20,
            'min_spend' => 100000,
            'is_active' => true,
            'expires_at' => Carbon::now()->addDays(5),
        ]);

        $couponExpired = Coupon::create([
            'code' => 'EXPIREDCODE',
            'type' => 'percentage',
            'value' => 10,
            'min_spend' => 50000,
            'is_active' => true,
            'expires_at' => Carbon::now()->subDays(1),
        ]);

        $couponInactive = Coupon::create([
            'code' => 'INACTIVECODE',
            'type' => 'fixed',
            'value' => 15000,
            'min_spend' => 50000,
            'is_active' => false,
            'expires_at' => Carbon::now()->addDays(5),
        ]);

        // 1. Apply valid coupon with sufficient subtotal
        $response = $this->postJson(route('storefront.coupon.apply'), [
            'code' => 'DISCOUNT20',
            'subtotal' => 150000,
        ]);
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'code' => 'DISCOUNT20',
                'discount_amount' => 30000, // 20% of 150,000
            ]);

        // 2. Apply valid coupon with insufficient subtotal
        $response = $this->postJson(route('storefront.coupon.apply'), [
            'code' => 'DISCOUNT20',
            'subtotal' => 80000,
        ]);
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);

        // 3. Apply expired coupon
        $response = $this->postJson(route('storefront.coupon.apply'), [
            'code' => 'EXPIREDCODE',
            'subtotal' => 100000,
        ]);
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Kupon ini sudah kedaluwarsa.',
            ]);

        // 4. Apply inactive coupon
        $response = $this->postJson(route('storefront.coupon.apply'), [
            'code' => 'INACTIVECODE',
            'subtotal' => 100000,
        ]);
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Kupon ini sudah tidak aktif.',
            ]);

        // 5. Apply non-existing coupon
        $response = $this->postJson(route('storefront.coupon.apply'), [
            'code' => 'FAKECODE',
            'subtotal' => 100000,
        ]);
        $response->assertStatus(404);
    }

    /**
     * Test coupon apply fails when flash sale item is present.
     */
    public function test_coupon_apply_fails_when_flash_sale_product_present(): void
    {
        // 1. Setup Flash Sale settings
        \App\Models\Setting::create(['key' => 'flash_sale_is_active', 'value' => '1']);
        \App\Models\Setting::create(['key' => 'flash_sale_start_time', 'value' => now()->subDay()->toDateTimeString()]);
        \App\Models\Setting::create(['key' => 'flash_sale_end_time', 'value' => now()->addDay()->toDateTimeString()]);

        // 2. Create coupon
        $coupon = Coupon::create([
            'code' => 'DISCOUNT20',
            'type' => 'percentage',
            'value' => 20,
            'min_spend' => 50000,
            'is_active' => true,
        ]);

        // 3. Create flash sale product and variant
        $category = \App\Models\Category::create(['name' => 'Dress', 'slug' => 'dress', 'sort_order' => 1]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Flash Sale Dress',
            'slug' => 'flash-sale-dress',
            'sku' => 'FS-DRS',
            'weight' => 500,
            'base_price' => 100000,
            'status' => 'active',
        ]);
        
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'FS-DRS-S',
            'name' => 'S',
            'price' => 100000,
            'stock' => 10,
        ]);

        \App\Models\FlashSaleProduct::create([
            'product_id' => $product->id,
            'discount_type' => 'percentage',
            'discount_value' => 10,
        ]);

        // 4. Test apply coupon API with the flash sale item
        $response = $this->postJson(route('storefront.coupon.apply'), [
            'code' => 'DISCOUNT20',
            'subtotal' => 90000,
            'items' => [
                ['variant_id' => $variant->id, 'quantity' => 1]
            ]
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Kupon diskon tidak dapat digunakan karena terdapat produk Flash Sale di keranjang belanja Anda.',
            ]);
    }
}
