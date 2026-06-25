<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CouponController extends Controller
{
    public function index(): Response
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Coupons', [
            'coupons' => $coupons,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'min_spend' => 'nullable|numeric|min:0',
            'is_active' => 'required|boolean',
            'expires_at' => 'nullable|date',
        ]);

        // Automatically uppercase code
        $validated['code'] = strtoupper(trim($validated['code']));

        // Check if unique after uppercase
        if (Coupon::where('code', $validated['code'])->exists()) {
            return back()->withErrors(['code' => 'Kode kupon sudah terdaftar.']);
        }

        // Custom validation: percentage cannot exceed 100
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Diskon persentase tidak boleh melebihi 100%.']);
        }

        Coupon::create($validated);

        return redirect()->route('admin.coupons')->with('success', 'Kupon berhasil ditambahkan.');
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'min_spend' => 'nullable|numeric|min:0',
            'is_active' => 'required|boolean',
            'expires_at' => 'nullable|date',
        ]);

        // Automatically uppercase code
        $validated['code'] = strtoupper(trim($validated['code']));

        // Check if unique after uppercase (excluding current coupon)
        if (Coupon::where('code', $validated['code'])->where('id', '!=', $coupon->id)->exists()) {
            return back()->withErrors(['code' => 'Kode kupon sudah terdaftar.']);
        }

        // Custom validation: percentage cannot exceed 100
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Diskon persentase tidak boleh melebihi 100%.']);
        }

        $coupon->update($validated);

        return redirect()->route('admin.coupons')->with('success', 'Kupon berhasil diperbarui.');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return redirect()->route('admin.coupons')->with('success', 'Kupon berhasil dihapus.');
    }
}
