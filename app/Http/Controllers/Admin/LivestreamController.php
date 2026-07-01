<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Livestream;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class LivestreamController extends Controller
{
    public function index(): Response
    {
        $livestreams = Livestream::orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Livestream', [
            'livestreams' => $livestreams,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'tiktok_url' => 'required|string|url',
            'is_active' => 'required|boolean',
        ]);

        Livestream::create($validated);

        return redirect()->route('admin.livestream')->with('success', 'Livestream berhasil ditambahkan.');
    }

    public function update(Request $request, Livestream $livestream): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'tiktok_url' => 'required|string|url',
            'is_active' => 'required|boolean',
        ]);

        $livestream->update($validated);

        return redirect()->route('admin.livestream')->with('success', 'Livestream berhasil diperbarui.');
    }

    public function destroy(Livestream $livestream): RedirectResponse
    {
        $livestream->delete();
        return redirect()->route('admin.livestream')->with('success', 'Livestream berhasil dihapus.');
    }
}
