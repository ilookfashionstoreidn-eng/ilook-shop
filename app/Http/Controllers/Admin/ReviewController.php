<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ReviewController extends Controller
{
    /**
     * Display a listing of the reviews.
     */
    public function index(Request $request): Response
    {
        $query = ProductReview::with('product');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('user_name', 'like', '%' . $search . '%')
                  ->orWhere('comment', 'like', '%' . $search . '%')
                  ->orWhereHas('product', function($pq) use ($search) {
                      $pq->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        $reviews = $query->orderBy('review_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get list of products for create/edit select dropdown
        $products = Product::select('id', 'name')->orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Reviews', [
            'reviews' => $reviews,
            'products' => $products,
            'filters' => $request->only(['search', 'rating', 'product_id']),
        ]);
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'review_date' => 'nullable|date',
        ]);

        $validated['review_date'] = $request->filled('review_date') 
            ? Carbon::parse($validated['review_date']) 
            : Carbon::now();

        ProductReview::create($validated);

        return redirect()->route('admin.reviews')->with('success', 'Ulasan/rating berhasil ditambahkan!');
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, ProductReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'review_date' => 'nullable|date',
        ]);

        $validated['review_date'] = $request->filled('review_date') 
            ? Carbon::parse($validated['review_date']) 
            : Carbon::now();

        $review->update($validated);

        return redirect()->route('admin.reviews')->with('success', 'Ulasan/rating berhasil diperbarui!');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(ProductReview $review): RedirectResponse
    {
        $review->delete();

        return redirect()->route('admin.reviews')->with('success', 'Ulasan/rating berhasil dihapus!');
    }
}
