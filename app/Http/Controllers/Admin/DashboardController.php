<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // 1. Get total stats
        $validStatuses = ['paid', 'processing', 'shipped', 'delivered'];
        
        $totalSales = Order::whereIn('status', $validStatuses)->sum('total_amount');
        $totalOrders = Order::count();
        $totalProducts = Product::count();

        // Get min stock alert setting
        $minStockSetting = Setting::where('key', 'min_stock_alert')->first();
        $minStock = $minStockSetting ? (int)$minStockSetting->value : 5;

        $criticalStockCount = ProductVariant::where('stock', '<=', $minStock)->count();

        // 2. 7-Day Revenue Chart Data
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateString = $date->format('Y-m-d');
            $dateLabel = $date->format('d M');

            $revenue = Order::whereIn('status', $validStatuses)
                ->whereDate('created_at', $dateString)
                ->sum('total_amount');

            $ordersCount = Order::whereDate('created_at', $dateString)->count();

            $chartData[] = [
                'date' => $dateLabel,
                'revenue' => (float)$revenue,
                'orders' => $ordersCount
            ];
        }

        // 3. Recent 5 Orders
        $recentOrders = Order::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'buyer_name' => $order->shipping ? $order->shipping->recipient_name : ($order->user ? $order->user->name : 'N/A'),
                    'total_amount' => (float)$order->total_amount,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'items_count' => $order->items->sum('quantity'),
                    'created_at' => $order->created_at->format('d M Y H:i'),
                ];
            });

        // 4. Low stock variants list
        $lowStockVariants = ProductVariant::with('product')
            ->where('stock', '<=', $minStock)
            ->orderBy('stock', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($variant) {
                return [
                    'id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_name' => $variant->name,
                    'sku' => $variant->sku,
                    'stock' => $variant->stock,
                ];
            });

        // 5. Order Status Counts
        $statusCounts = Order::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_sales' => (float)$totalSales,
                'total_orders' => $totalOrders,
                'total_products' => $totalProducts,
                'critical_stock' => $criticalStockCount,
            ],
            'chartData' => $chartData,
            'recentOrders' => $recentOrders,
            'lowStockVariants' => $lowStockVariants,
            'statusCounts' => $statusCounts,
            'minStockThreshold' => $minStock,
        ]);
    }
}
