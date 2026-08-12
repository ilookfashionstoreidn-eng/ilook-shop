<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::with('parent')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        // Separate parent categories for the dropdown selector
        $parentCategories = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'required|integer',
            'image_url' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure unique slug
        $slugCount = Category::where('slug', 'like', $validated['slug'].'%')->count();
        if ($slugCount > 0) {
            $validated['slug'] .= '-'.($slugCount + 1);
        }

        Category::create($validated);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Note: 'different:id' here is a no-op — Laravel's `different` rule
            // compares against another *input* field named "id", which this
            // form never sends (the category's id comes from the route, not
            // the payload). The real guard is the self/circular check below.
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'required|integer',
            'image_url' => 'nullable|string',
        ]);

        // Reject selecting itself directly...
        if ($validated['parent_id'] && (int) $validated['parent_id'] === $category->id) {
            return back()->withErrors(['parent_id' => 'Kategori tidak bisa menjadi induk untuk dirinya sendiri.']);
        }

        // ...or indirectly (picking a descendant, which would create a cycle).
        // Bounded to guard against traversing a cycle already present in bad data.
        if ($validated['parent_id']) {
            $currentParentId = $validated['parent_id'];
            $hops = 0;
            while ($currentParentId && $hops < 50) {
                if ((int) $currentParentId === $category->id) {
                    return back()->withErrors(['parent_id' => 'Tidak dapat memilih sub-kategori sebagai induk (mencegah dependensi melingkar).']);
                }
                $parentCategory = Category::find($currentParentId);
                $currentParentId = $parentCategory?->parent_id;
                $hops++;
            }
        }

        if ($category->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
            $slugCount = Category::where('slug', 'like', $validated['slug'].'%')->where('id', '!=', $category->id)->count();
            if ($slugCount > 0) {
                $validated['slug'] .= '-'.($slugCount + 1);
            }
        }

        $category->update($validated);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete(); // This deletes child categories as well due to onDelete('cascade') in migration.

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
