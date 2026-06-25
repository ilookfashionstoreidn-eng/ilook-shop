<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settingsRaw = Setting::all();
        $settings = [];
        
        foreach ($settingsRaw as $setting) {
            $value = $setting->value;
            // Detect if value is JSON
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            }
            $settings[$setting->key] = $value;
        }

        // Default fallbacks if they don't exist
        $defaults = [
            'shop_name' => 'iLook Fashion',
            'whatsapp_number' => '081234567890',
            'origin_city_id' => '152',
            'origin_city_name' => 'Jakarta Barat',
            'min_stock_alert' => 5,
            'ginee_sync_enabled' => false,
            'couriers_active' => ['jne', 'jnt', 'sicepat'],
        ];

        $settings = array_merge($defaults, $settings);

        // List of cities for dropdown (mocking Raja Ongkir API city list)
        $cities = [
            ['id' => 152, 'name' => 'Jakarta Barat (DKI Jakarta)'],
            ['id' => 154, 'name' => 'Jakarta Selatan (DKI Jakarta)'],
            ['id' => 23, 'name' => 'Bandung (Jawa Barat)'],
            ['id' => 444, 'name' => 'Surabaya (Jawa Timur)'],
            ['id' => 501, 'name' => 'Yogyakarta (DI Yogyakarta)'],
            ['id' => 256, 'name' => 'Medan (Sumatera Utara)'],
            ['id' => 115, 'name' => 'Denpasar (Bali)'],
        ];

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'cities' => $cities,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'whatsapp_number' => 'required|string|max:20',
            'origin_city_id' => 'required|integer',
            'min_stock_alert' => 'required|integer|min:0',
            'ginee_sync_enabled' => 'required|boolean',
            'couriers_active' => 'required|array',
        ]);

        // Mock city names mapping
        $cityNames = [
            152 => 'Jakarta Barat',
            154 => 'Jakarta Selatan',
            23 => 'Bandung',
            444 => 'Surabaya',
            501 => 'Yogyakarta',
            256 => 'Medan',
            115 => 'Denpasar',
        ];

        $validated['origin_city_name'] = $cityNames[$validated['origin_city_id']] ?? 'Unknown City';

        foreach ($validated as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            } elseif (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return redirect()->route('admin.settings')->with('success', 'Pengaturan toko berhasil diperbarui.');
    }
}
