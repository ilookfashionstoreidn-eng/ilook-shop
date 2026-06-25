<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\StockLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $query = ProductVariant::with('product');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $stocks = $query->orderBy('stock', 'asc')->paginate(15)->withQueryString();

        // Get latest 30 stock logs
        $stockLogs = StockLog::with(['variant.product'])
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'sku' => $log->variant ? $log->variant->sku : 'N/A',
                    'product_name' => $log->variant && $log->variant->product ? $log->variant->product->name : 'N/A',
                    'variant_name' => $log->variant ? $log->variant->name : 'N/A',
                    'before' => $log->before,
                    'after' => $log->after,
                    'change' => $log->after - $log->before,
                    'reason' => $log->reason,
                    'created_at' => $log->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/Stocks', [
            'stocks' => $stocks,
            'stockLogs' => $stockLogs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function update(Request $request, ProductVariant $variant): RedirectResponse
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
            'reason' => 'required|string|max:255',
        ]);

        $oldStock = $variant->stock;
        $newStock = (int)$validated['stock'];

        if ($oldStock !== $newStock) {
            DB::transaction(function () use ($variant, $oldStock, $newStock, $validated) {
                $variant->update(['stock' => $newStock]);

                StockLog::create([
                    'product_variant_id' => $variant->id,
                    'before' => $oldStock,
                    'after' => $newStock,
                    'reason' => $validated['reason'] ?: 'manual_adjust',
                ]);

                // Update product status to out_of_stock if all variants have 0 stock
                $product = $variant->product;
                $totalStock = $product->variants()->sum('stock');
                if ($totalStock === 0) {
                    $product->update(['status' => 'out_of_stock']);
                } elseif ($product->status === 'out_of_stock' && $totalStock > 0) {
                    $product->update(['status' => 'active']);
                }
            });
        }

        return redirect()->route('admin.stocks')->with('success', "Stok untuk variant {$variant->sku} berhasil diperbarui.");
    }
}
