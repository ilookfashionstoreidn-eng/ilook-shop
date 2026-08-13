<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\RajaOngkirService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    protected RajaOngkirService $rajaOngkir;

    public function __construct(RajaOngkirService $rajaOngkir)
    {
        $this->rajaOngkir = $rajaOngkir;
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $isBuyer = $request->user()->role !== 'admin';

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            // Only buyers get the shipping-address form, so skip the
            // RajaOngkir call entirely for admins.
            'provinces' => $isBuyer ? $this->rajaOngkir->getProvinces() : [],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Save the buyer's default shipping address (used to prefill checkout).
     */
    public function updateShipping(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'address' => 'required|string|max:2000',
            'kelurahan' => 'required|string|max:255',
            'kecamatan' => 'required|string|max:255',
            'rajaongkir_province_id' => 'required|string',
            'province' => 'required|string|max:255',
            'rajaongkir_city_id' => 'required|string',
            'city' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $request->user()->update($validated);

        return Redirect::route('profile.edit')->with('status', 'shipping-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
