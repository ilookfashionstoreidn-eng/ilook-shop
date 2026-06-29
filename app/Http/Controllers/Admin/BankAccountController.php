<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the bank accounts.
     */
    public function index(): Response
    {
        $bankAccounts = BankAccount::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Payments', [
            'bankAccounts' => $bankAccounts,
        ]);
    }

    /**
     * Store a newly created bank account in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:50',
            'account_number' => 'required|string|max:30',
            'account_holder' => 'required|string|max:100',
            'is_active' => 'required|boolean',
        ]);

        BankAccount::create($validated);

        return redirect()->route('admin.payments')->with('success', 'Rekening bank berhasil ditambahkan.');
    }

    /**
     * Update the specified bank account in storage.
     */
    public function update(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:50',
            'account_number' => 'required|string|max:30',
            'account_holder' => 'required|string|max:100',
            'is_active' => 'required|boolean',
        ]);

        $bankAccount->update($validated);

        return redirect()->route('admin.payments')->with('success', 'Rekening bank berhasil diperbarui.');
    }

    /**
     * Remove the specified bank account from storage.
     */
    public function destroy(BankAccount $bankAccount): RedirectResponse
    {
        $bankAccount->delete();

        return redirect()->route('admin.payments')->with('success', 'Rekening bank berhasil dihapus.');
    }
}
