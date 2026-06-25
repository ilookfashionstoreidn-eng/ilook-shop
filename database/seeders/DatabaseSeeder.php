<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShipping;
use App\Models\Setting;
use App\Models\Coupon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::factory()->create([
            'name' => 'Admin iLook Fashion',
            'email' => 'admin@ilookfashion.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '081234567890',
        ]);

        // Buyer User for orders
        $buyer = User::factory()->create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => bcrypt('password'),
            'role' => 'buyer',
            'phone' => '089988776655',
        ]);

        // 2. Categories
        $pakaianWanita = Category::create([
            'name' => 'Pakaian Wanita',
            'slug' => 'pakaian-wanita',
            'sort_order' => 1,
        ]);

        $dress = Category::create([
            'name' => 'Dress',
            'slug' => 'dress',
            'parent_id' => $pakaianWanita->id,
            'sort_order' => 1,
        ]);

        $blouse = Category::create([
            'name' => 'Blouse',
            'slug' => 'blouse',
            'parent_id' => $pakaianWanita->id,
            'sort_order' => 2,
        ]);

        $pakaianPria = Category::create([
            'name' => 'Pakaian Pria',
            'slug' => 'pakaian-pria',
            'sort_order' => 2,
        ]);

        $kemeja = Category::create([
            'name' => 'Kemeja',
            'slug' => 'kemeja',
            'parent_id' => $pakaianPria->id,
            'sort_order' => 1,
        ]);

        $kaos = Category::create([
            'name' => 'Kaos',
            'slug' => 'kaos',
            'parent_id' => $pakaianPria->id,
            'sort_order' => 2,
        ]);

        // 3. Products & Variants & Stock Logs
        // Product 1
        $p1 = Product::create([
            'category_id' => $dress->id,
            'name' => 'Dress Satin Silk Premium',
            'slug' => 'dress-satin-silk-premium',
            'description' => '<p>Dress satin silk premium dengan kerah V yang anggun, bahan jatuh, berkilau mewah, dan tidak menerawang. Sangat cocok digunakan untuk acara formal maupun pesta malam.</p><p><strong>Detail Bahan:</strong> Premium Satin Silk</p>',
            'sku' => 'DRS-SATIN-SLK',
            'weight' => 400,
            'length' => 30,
            'width' => 20,
            'height' => 5,
            'base_price' => 350000.00,
            'sale_price' => 299000.00,
            'status' => 'active',
            'ginee_product_id' => 'gn-prod-110293',
            'images' => [
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=60'
            ]
        ]);

        $v1_1 = ProductVariant::create([
            'product_id' => $p1->id,
            'sku' => 'DRS-SATIN-SLK-S-BLK',
            'name' => 'S / Hitam',
            'price' => 299000.00,
            'stock' => 12,
            'ginee_variant_id' => 'gn-var-110293-1'
        ]);
        StockLog::create(['product_variant_id' => $v1_1->id, 'before' => 0, 'after' => 12, 'reason' => 'initial_seed']);

        $v1_2 = ProductVariant::create([
            'product_id' => $p1->id,
            'sku' => 'DRS-SATIN-SLK-M-BLK',
            'name' => 'M / Hitam',
            'price' => 299000.00,
            'stock' => 8,
            'ginee_variant_id' => 'gn-var-110293-2'
        ]);
        StockLog::create(['product_variant_id' => $v1_2->id, 'before' => 0, 'after' => 8, 'reason' => 'initial_seed']);

        $v1_3 = ProductVariant::create([
            'product_id' => $p1->id,
            'sku' => 'DRS-SATIN-SLK-S-GRN',
            'name' => 'S / Sage Green',
            'price' => 310000.00, // Override price
            'stock' => 0, // Out of Stock
            'ginee_variant_id' => 'gn-var-110293-3'
        ]);
        StockLog::create(['product_variant_id' => $v1_3->id, 'before' => 0, 'after' => 0, 'reason' => 'initial_seed']);

        $v1_4 = ProductVariant::create([
            'product_id' => $p1->id,
            'sku' => 'DRS-SATIN-SLK-M-GRN',
            'name' => 'M / Sage Green',
            'price' => 310000.00, // Override price
            'stock' => 15,
            'ginee_variant_id' => 'gn-var-110293-4'
        ]);
        StockLog::create(['product_variant_id' => $v1_4->id, 'before' => 0, 'after' => 15, 'reason' => 'initial_seed']);


        // Product 2
        $p2 = Product::create([
            'category_id' => $kemeja->id,
            'name' => 'Kemeja Linen Oversized Collarless',
            'slug' => 'kemeja-linen-oversized-collarless',
            'description' => '<p>Kemeja lengan panjang berbahan Pure Linen dengan kerah shanghai/collarless. Potongan oversized kekinian memberikan kesan kasual tapi tetap rapi dan modis.</p><p><strong>Detail Bahan:</strong> 100% Pure Linen Grade A</p>',
            'sku' => 'KMJ-LINEN-OVS',
            'weight' => 350,
            'length' => 25,
            'width' => 18,
            'height' => 4,
            'base_price' => 220000.00,
            'sale_price' => 189000.00,
            'status' => 'active',
            'ginee_product_id' => 'gn-prod-228304',
            'images' => [
                'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=800&auto=format&fit=crop&q=60'
            ]
        ]);

        $v2_1 = ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'KMJ-LINEN-OVS-M-WHT',
            'name' => 'M / Broken White',
            'price' => 189000.00,
            'stock' => 25,
            'ginee_variant_id' => 'gn-var-228304-1'
        ]);
        StockLog::create(['product_variant_id' => $v2_1->id, 'before' => 0, 'after' => 25, 'reason' => 'initial_seed']);

        $v2_2 = ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'KMJ-LINEN-OVS-L-WHT',
            'name' => 'L / Broken White',
            'price' => 189000.00,
            'stock' => 3, // Low stock alert!
            'ginee_variant_id' => 'gn-var-228304-2'
        ]);
        StockLog::create(['product_variant_id' => $v2_2->id, 'before' => 0, 'after' => 3, 'reason' => 'initial_seed']);

        $v2_3 = ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'KMJ-LINEN-OVS-M-NVY',
            'name' => 'M / Navy Blue',
            'price' => 189000.00,
            'stock' => 18,
            'ginee_variant_id' => 'gn-var-228304-3'
        ]);
        StockLog::create(['product_variant_id' => $v2_3->id, 'before' => 0, 'after' => 18, 'reason' => 'initial_seed']);

        $v2_4 = ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'KMJ-LINEN-OVS-L-NVY',
            'name' => 'L / Navy Blue',
            'price' => 189000.00,
            'stock' => 20,
            'ginee_variant_id' => 'gn-var-228304-4'
        ]);
        StockLog::create(['product_variant_id' => $v2_4->id, 'before' => 0, 'after' => 20, 'reason' => 'initial_seed']);

        // Product 3 (No sale price)
        $p3 = Product::create([
            'category_id' => $kaos->id,
            'name' => 'Kaos Basic Cotton Combed 30s',
            'slug' => 'kaos-basic-cotton-combed-30s',
            'description' => '<p>Kaos basic sehari-hari dengan serat benang halus, jahitan rantai rapi di pundak, tidak luntur, menyerap keringat dengan sangat baik.</p>',
            'sku' => 'KAS-COMB-30S',
            'weight' => 200,
            'length' => 20,
            'width' => 15,
            'height' => 2,
            'base_price' => 99000.00,
            'status' => 'active',
            'ginee_product_id' => 'gn-prod-990021',
            'images' => [
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60'
            ]
        ]);

        $v3_1 = ProductVariant::create([
            'product_id' => $p3->id,
            'sku' => 'KAS-COMB-30S-M-BLK',
            'name' => 'M / Hitam',
            'price' => 99000.00,
            'stock' => 50,
            'ginee_variant_id' => 'gn-var-990021-1'
        ]);
        StockLog::create(['product_variant_id' => $v3_1->id, 'before' => 0, 'after' => 50, 'reason' => 'initial_seed']);

        $v3_2 = ProductVariant::create([
            'product_id' => $p3->id,
            'sku' => 'KAS-COMB-30S-L-BLK',
            'name' => 'L / Hitam',
            'price' => 99000.00,
            'stock' => 45,
            'ginee_variant_id' => 'gn-var-990021-2'
        ]);
        StockLog::create(['product_variant_id' => $v3_2->id, 'before' => 0, 'after' => 45, 'reason' => 'initial_seed']);


        // 4. Settings
        Setting::create(['key' => 'shop_name', 'value' => 'iLook Fashion']);
        Setting::create(['key' => 'whatsapp_number', 'value' => '081234567890']);
        Setting::create(['key' => 'origin_city_id', 'value' => '152']); // Jakarta Barat
        Setting::create(['key' => 'origin_city_name', 'value' => 'Jakarta Barat']);
        Setting::create(['key' => 'min_stock_alert', 'value' => '5']);
        Setting::create(['key' => 'ginee_sync_enabled', 'value' => '1']);
        Setting::create(['key' => 'couriers_active', 'value' => json_encode(['jne', 'jnt', 'sicepat', 'anteraja'])]);

        // 4.5. Coupons
        Coupon::create([
            'code' => 'DISKON10',
            'type' => 'percentage',
            'value' => 10.00,
            'min_spend' => 100000.00,
            'is_active' => true,
            'expires_at' => Carbon::now()->addDays(30),
        ]);

        Coupon::create([
            'code' => 'CASHBACK50K',
            'type' => 'fixed',
            'value' => 50000.00,
            'min_spend' => 150000.00,
            'is_active' => true,
            'expires_at' => Carbon::now()->addDays(30),
        ]);

        Coupon::create([
            'code' => 'KODEEXPIRED',
            'type' => 'percentage',
            'value' => 15.00,
            'min_spend' => 50000.00,
            'is_active' => true,
            'expires_at' => Carbon::now()->subDays(1),
        ]);


        // 5. Orders (seed 10 orders across the last 7 days)
        $statuses = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
        $methods = ['Virtual Account BCA', 'GoPay', 'Virtual Account Mandiri', 'QRIS', 'Credit Card'];
        
        $customerNames = ['Siti Aminah', 'Rian Hidayat', 'Dewi Lestari', 'Andi Pratama', 'Eko Saputra', 'Jessica Wijaya', 'Farhan Maulana', 'Mega Utami'];
        $cities = [
            ['id' => 152, 'name' => 'Jakarta Barat', 'prov' => 'DKI Jakarta', 'postal' => '11610'],
            ['id' => 154, 'name' => 'Jakarta Selatan', 'prov' => 'DKI Jakarta', 'postal' => '12190'],
            ['id' => 23, 'name' => 'Bandung', 'prov' => 'Jawa Barat', 'postal' => '40111'],
            ['id' => 444, 'name' => 'Surabaya', 'prov' => 'Jawa Timur', 'postal' => '60111'],
            ['id' => 501, 'name' => 'Yogyakarta', 'prov' => 'DI Yogyakarta', 'postal' => '55111'],
        ];

        $variantsPool = [$v1_1, $v1_2, $v1_4, $v2_1, $v2_3, $v2_4, $v3_1, $v3_2];

        for ($i = 1; $i <= 12; $i++) {
            $date = Carbon::now()->subDays(rand(0, 7))->subHours(rand(1, 23));
            $status = $statuses[rand(0, count($statuses) - 1)];
            
            // Adjust payment status based on order status
            $payStatus = 'unpaid';
            if (in_array($status, ['paid', 'processing', 'shipped', 'delivered'])) {
                $payStatus = 'paid';
            } elseif ($status == 'cancelled') {
                $payStatus = 'failed';
            }

            // Get random items
            $numItems = rand(1, 2);
            $orderItemsData = [];
            $subtotal = 0;
            
            for ($j = 0; $j < $numItems; $j++) {
                $variant = $variantsPool[rand(0, count($variantsPool) - 1)];
                $qty = rand(1, 2);
                $price = $variant->price ?? $variant->product->base_price;
                $itemSub = $price * $qty;
                
                $orderItemsData[] = [
                    'variant' => $variant,
                    'qty' => $qty,
                    'price' => $price,
                    'subtotal' => $itemSub
                ];
                
                $subtotal += $itemSub;
            }

            $shippingCost = rand(9, 25) * 1000;
            $totalAmount = $subtotal + $shippingCost;
            
            $order = Order::create([
                'order_number' => 'ILK-' . $date->format('Ymd') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'user_id' => $buyer->id,
                'status' => $status,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'payment_method' => $methods[rand(0, count($methods) - 1)],
                'payment_status' => $payStatus,
                'snap_token' => 'snap-tok-' . Str::random(16),
                'ginee_order_id' => $payStatus == 'paid' ? 'gn-ord-' . rand(100000, 999999) : null,
                'created_at' => $date,
                'updated_at' => $date,
            ]);

            foreach ($orderItemsData as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_variant_id' => $item['variant']->id,
                    'product_name' => $item['variant']->product->name,
                    'variant_label' => $item['variant']->name,
                    'unit_price' => $item['price'],
                    'quantity' => $item['qty'],
                    'subtotal' => $item['subtotal'],
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }

            $city = $cities[rand(0, count($cities) - 1)];
            $custName = $customerNames[rand(0, count($customerNames) - 1)];
            
            OrderShipping::create([
                'order_id' => $order->id,
                'courier' => ['jne', 'jnt', 'sicepat'][rand(0, 2)],
                'service' => ['REG', 'OKE', 'YES'][rand(0, 2)],
                'courier_name' => 'Kurir Express',
                'tracking_number' => in_array($status, ['shipped', 'delivered']) ? 'JP' . rand(1000000000, 9999999999) : null,
                'rajaongkir_city_id' => $city['id'],
                'recipient_name' => $custName,
                'phone' => '08' . rand(100000000, 999999999),
                'address' => 'Jl. Kebahagiaan No. ' . rand(1, 100) . ', RT ' . rand(1, 9) . '/RW ' . rand(1, 9),
                'city' => $city['name'],
                'province' => $city['prov'],
                'postal_code' => $city['postal'],
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}
