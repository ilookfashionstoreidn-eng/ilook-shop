<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PhoneEntryController extends Controller
{
    /**
     * Show the enter phone form.
     */
    public function show(): Response
    {
        return Inertia::render('Auth/EnterPhone');
    }

    /**
     * Store the phone number.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'min:9', 'max:20', 'regex:/^[0-9\-\+\s]+$/'],
        ], [
            'phone.required' => 'Nomor HP wajib diisi.',
            'phone.min' => 'Nomor HP minimal terdiri dari 9 angka.',
            'phone.max' => 'Nomor HP maksimal terdiri dari 20 angka.',
            'phone.regex' => 'Format nomor HP tidak valid (hanya angka, spasi, tanda hubung -, dan awalan + yang diperbolehkan).',
        ]);

        $user = $request->user();
        $user->phone = $request->phone;
        $user->save();

        return redirect()->intended(route('storefront.home', absolute: false));
    }
}
