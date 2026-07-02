<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TaxSettingController extends Controller
{
    public function index(): Response
    {
        $settingsRaw = Setting::all()->pluck('value', 'key')->toArray();

        $settings = [
            'tax_type' => $settingsRaw['tax_type'] ?? 'percentage',
            'tax_value' => (float)($settingsRaw['tax_value'] ?? 0.00),
            'admin_fee_type' => $settingsRaw['admin_fee_type'] ?? 'nominal',
            'admin_fee_value' => (float)($settingsRaw['admin_fee_value'] ?? 0.00),
        ];

        return Inertia::render('Admin/TaxSettings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tax_type' => 'required|string|in:percentage,nominal',
            'tax_value' => 'required|numeric|min:0',
            'admin_fee_type' => 'required|string|in:percentage,nominal',
            'admin_fee_value' => 'required|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value]
            );
        }

        return redirect()->route('admin.tax-settings')->with('success', 'Pengaturan PPN dan Biaya Admin berhasil diperbarui.');
    }
}
