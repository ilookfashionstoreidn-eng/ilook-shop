<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RatingTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_complete_delivered_order(): void
    {
        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'ILK-TEST-1234',
            'user_id' => $user->id,
            'status' => 'delivered',
            'subtotal' => 100000,
            'shipping_cost' => 10000,
            'total_amount' => 110000,
            'payment_method' => 'midtrans',
            'payment_status' => 'paid',
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('storefront.order.complete', $order->id));

        $response->assertRedirect();
        $this->assertEquals('completed', $order->fresh()->status);
    }

    public function test_buyer_cannot_complete_pending_order(): void
    {
        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'ILK-TEST-1234',
            'user_id' => $user->id,
            'status' => 'pending_payment',
            'subtotal' => 100000,
            'shipping_cost' => 10000,
            'total_amount' => 110000,
            'payment_method' => 'midtrans',
            'payment_status' => 'unpaid',
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('storefront.order.complete', $order->id));

        $response->assertSessionHas('error');
        $this->assertEquals('pending_payment', $order->fresh()->status);
    }

    public function test_buyer_can_review_purchased_product(): void
    {
        $user = User::factory()->create([
            'name' => 'Sarah Wijaya'
        ]);

        $category = Category::create([
            'name' => 'Dress',
            'slug' => 'dress',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Beautiful Dress',
            'slug' => 'beautiful-dress',
            'description' => 'A beautiful dress',
            'base_price' => 100000,
            'weight' => 200,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'BD-01',
            'name' => 'All Size',
            'price' => 100000,
            'stock' => 10,
        ]);

        $order = Order::create([
            'order_number' => 'ILK-TEST-1234',
            'user_id' => $user->id,
            'status' => 'completed',
            'subtotal' => 100000,
            'shipping_cost' => 10000,
            'total_amount' => 110000,
            'payment_method' => 'midtrans',
            'payment_status' => 'paid',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_label' => $variant->name,
            'unit_price' => 100000,
            'quantity' => 1,
            'subtotal' => 100000,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('storefront.order.review', $order->id), [
                'product_id' => $product->id,
                'rating' => 5,
                'comment' => 'Very beautiful dress!',
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('product_reviews', [
            'product_id' => $product->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'rating' => 5,
            'comment' => 'Very beautiful dress!',
            'user_name' => 'Sarah Wijaya',
        ]);
    }
}
