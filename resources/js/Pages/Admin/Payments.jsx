import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    CreditCard,
    X,
    CheckCircle,
    XCircle,
    Copy,
    Check,
} from 'lucide-react';

export default function Payments({ bankAccounts }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentAccountId, setCurrentAccountId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const { data, setData, post, put, delete: destroy, errors, reset, processing } = useForm({
        bank_name: '',
        account_number: '',
        account_holder: '',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setCurrentAccountId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        setEditMode(true);
        setCurrentAccountId(account.id);
        setData({
            bank_name: account.bank_name,
            account_number: account.account_number,
            account_holder: account.account_holder,
            is_active: account.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSaveAccount = (e) => {
        e.preventDefault();

        if (editMode) {
            put(route('admin.payments.update', currentAccountId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.payments.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteAccount = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus rekening bank ini?')) {
            destroy(route('admin.payments.destroy', id));
        }
    };

    const handleToggleStatus = (account) => {
        router.put(route('admin.payments.update', account.id), {
            bank_name: account.bank_name,
            account_number: account.account_number,
            account_holder: account.account_holder,
            is_active: !account.is_active,
        }, {
            preserveScroll: true,
        });
    };

    const handleCopyText = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Helper to get bank badge style
    const getBankColor = (bankName) => {
        const name = bankName.toLowerCase();
        if (name.includes('bca')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (name.includes('mandiri')) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        if (name.includes('bni')) return 'bg-orange-50 text-orange-700 border-orange-200';
        if (name.includes('bri')) return 'bg-sky-50 text-sky-700 border-sky-200';
        if (name.includes('gopay')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (name.includes('ovo')) return 'bg-purple-50 text-purple-700 border-purple-200';
        return 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Rekening Pembayaran - iLook Fashion" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 font-outfit">
                            <CreditCard className="w-6 h-6 text-emerald-600" />
                            Manajemen Rekening Pembayaran
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">Kelola data rekening bank dan e-wallet toko untuk mempermudah verifikasi transfer manual pelanggan.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Tambah Rekening Baru</span>
                    </button>
                </div>

                {/* Bank Accounts Table Card */}
                <div className="admin-card p-6 flex flex-col gap-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                            <thead>
                                <tr className="text-gray-400 font-bold uppercase tracking-wider text-xs">
                                    <th className="pb-3 px-4">Nama Bank</th>
                                    <th className="pb-3 px-4">Nomor Rekening</th>
                                    <th className="pb-3 px-4">Atas Nama (Pemilik)</th>
                                    <th className="pb-3 px-4 text-center">Status</th>
                                    <th className="pb-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700">
                                {bankAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400 font-medium">
                                            Belum ada rekening bank terdaftar. Klik "Tambah Rekening Baru" untuk membuat.
                                        </td>
                                    </tr>
                                ) : (
                                    bankAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold">
                                                <span className={`inline-block px-2.5 py-1 text-xs font-bold border rounded-md uppercase tracking-wider ${getBankColor(account.bank_name)}`}>
                                                    {account.bank_name}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-mono font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <span>{account.account_number}</span>
                                                    <button
                                                        onClick={() => handleCopyText(account.account_number, account.id)}
                                                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                        title="Salin nomor rekening"
                                                    >
                                                        {copiedId === account.id ? (
                                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-medium text-gray-700">
                                                {account.account_holder}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(account)}
                                                    className="inline-flex items-center justify-center focus:outline-none transition-transform active:scale-95"
                                                    title={account.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                                                >
                                                    {account.is_active ? (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Aktif</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                                                            <XCircle className="w-3 h-3" />
                                                            <span>Nonaktif</span>
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(account)}
                                                        className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
                                                        title="Ubah data"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAccount(account.id)}
                                                        className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                                        title="Hapus data"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 font-outfit">
                                {editMode ? 'Edit Rekening Pembayaran' : 'Tambah Rekening Pembayaran'}
                            </h3>
                            <p className="text-gray-500 text-xs mt-0.5">Lengkapi form berikut dengan data rekening valid.</p>
                        </div>

                        <form onSubmit={handleSaveAccount} className="space-y-4">
                            {/* Bank Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Nama Bank / Provider</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: BCA, Mandiri, BNI, GoPay"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                                {errors.bank_name && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.bank_name}</p>
                                )}
                            </div>

                            {/* Account Number */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Nomor Rekening / HP</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nomor rekening atau nomor HP"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                                {errors.account_number && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.account_number}</p>
                                )}
                            </div>

                            {/* Account Holder */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Nama Pemilik Rekening (Atas Nama)</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama lengkap pemilik rekening"
                                    value={data.account_holder}
                                    onChange={(e) => setData('account_holder', e.target.value)}
                                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                                {errors.account_holder && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.account_holder}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between py-2 border-t border-b border-gray-50">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Status Aktif</label>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Tampilkan rekening ini sebagai opsi pembayaran.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        data.is_active ? 'bg-emerald-500' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            data.is_active ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2.5 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4.5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all active:scale-[0.98]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
