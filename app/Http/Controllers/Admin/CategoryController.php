<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

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
        $slugCount = Category::where('slug', 'like', $validated['slug'] . '%')->count();
        if ($slugCount > 0) {
            $validated['slug'] .= '-' . ($slugCount + 1);
        }

        Category::create($validated);

        return redirect()->route('admin.categories')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id|different:id', // Cannot be own parent
            'sort_order' => 'required|integer',
            'image_url' => 'nullable|string',
        ]);

        // Prevent circular reference: parent_id cannot be a child of this category
        if ($validated['parent_id']) {
            $parent = Category::find($validated['parent_id']);
            if ($parent && $parent->parent_id === $category->id) {
                return back()->withErrors(['parent_id' => 'Tidak dapat memilih kategori anak sebagai induk.']);
            }
        }

        if ($category->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
            $slugCount = Category::where('slug', 'like', $validated['slug'] . '%')->where('id', '!=', $category->id)->count();
            if ($slugCount > 0) {
                $validated['slug'] .= '-' . ($slugCount + 1);
            }
        }

        $category->update($validated);

        return redirect()->route('admin.categories')->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete(); // This deletes child categories as well due to onDelete('cascade') in migration.
        return redirect()->route('admin.categories')->with('success', 'Kategori berhasil dihapus.');
    }
}
