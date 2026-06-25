import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    Tag,
    X,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Ticket,
} from 'lucide-react';

export default function Coupons({ coupons }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCouponId, setCurrentCouponId] = useState(null);

    const { data, setData, post, put, delete: destroy, errors, reset, processing } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        min_spend: 0,
        is_active: true,
        expires_at: '',
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const formatDateInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Format to YYYY-MM-DDThh:mm
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setCurrentCouponId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (coupon) => {
        setEditMode(true);
        setCurrentCouponId(coupon.id);
        setData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            min_spend: coupon.min_spend,
            is_active: coupon.is_active,
            expires_at: formatDateInput(coupon.expires_at),
        });
        setIsModalOpen(true);
    };

    const handleSaveCoupon = (e) => {
        e.preventDefault();

        // Convert expires_at to database format if empty
        const payload = {
            ...data,
            expires_at: data.expires_at ? data.expires_at.replace('T', ' ') + ':00' : null
        };

        if (editMode) {
            put(route('admin.coupons.update', currentCouponId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.coupons.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteCoupon = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kupon diskon ini?')) {
            destroy(route('admin.coupons.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Kupon Diskon - iLook Fashion" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 font-outfit">
                            <Ticket className="w-6 h-6 text-emerald-600" />
                            Manajemen Kupon Diskon
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">Kelola kupon potongan belanja untuk pembeli, baik berupa persentase maupun nominal potongan langsung.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Tambah Kupon Baru</span>
                    </button>
                </div>

                {/* Coupons Table Card */}
                <div className="admin-card p-6 flex flex-col gap-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                            <thead>
                                <tr className="text-gray-400 font-bold uppercase tracking-wider text-xs">
                                    <th className="pb-3 px-4">Kode Kupon</th>
                                    <th className="pb-3 px-4">Tipe Diskon</th>
                                    <th className="pb-3 px-4">Nilai Diskon</th>
                                    <th className="pb-3 px-4">Minimal Belanja</th>
                                    <th className="pb-3 px-4">Kedaluwarsa</th>
                                    <th className="pb-3 px-4 text-center">Status</th>
                                    <th className="pb-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700">
                                {coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-400 font-medium">
                                            Belum ada kupon diskon terdaftar. Klik "Tambah Kupon Baru" untuk membuat.
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-4 font-mono font-bold text-gray-900 tracking-wider">
                                                {coupon.code}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    coupon.type === 'percentage' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {coupon.type === 'percentage' ? 'Persentase' : 'Potongan Tetap'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-semibold text-gray-800">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                                            </td>
                                            <td className="py-4 px-4 text-gray-600 font-medium">
                                                {formatCurrency(coupon.min_spend)}
                                            </td>
                                            <td className="py-4 px-4 text-gray-500 flex items-center gap-1.5 mt-1.5 border-0">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span>
                                                    {coupon.expires_at 
                                                        ? new Date(coupon.expires_at).toLocaleDateString('id-ID', {
                                                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                          }) 
                                                        : 'Selamanya'
                                                    }
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {coupon.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>Aktif</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-bold">
                                                        <XCircle className="w-3 h-3" />
                                                        <span>Non-aktif</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(coupon)}
                                                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all shadow-sm border border-gray-100"
                                                        title="Edit Kupon"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all shadow-sm border border-red-100"
                                                        title="Hapus Kupon"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    {/* Content */}
                    <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl z-10 transition-all">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-lg font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <Tag className="w-5 h-5 text-emerald-600" />
                                <span>{editMode ? 'Edit Kupon Diskon' : 'Tambah Kupon Diskon Baru'}</span>
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="p-3 mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2 font-semibold">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <div>Silakan periksa kembali isian formulir Anda.</div>
                            </div>
                        )}

                        <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
                            {/* Code */}
                            <div className="space-y-1">
                                <label className="font-semibold text-gray-700 uppercase tracking-wider">Kode Kupon</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: PROMOAWALTAHUN"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    className="w-full bg-white border border-gray-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-mono font-bold uppercase tracking-wider"
                                />
                                {errors.code && <p className="text-red-500 mt-1 font-semibold">{errors.code}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Type */}
                                <div className="space-y-1">
                                    <label className="font-semibold text-gray-700 uppercase tracking-wider">Tipe Kupon</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full bg-white border border-gray-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-gray-850"
                                    >
                                        <option value="percentage">Persentase (%)</option>
                                        <option value="fixed">Potongan Flat (Rp)</option>
                                    </select>
                                    {errors.type && <p className="text-red-500 mt-1 font-semibold">{errors.type}</p>}
                                </div>

                                {/* Value */}
                                <div className="space-y-1">
                                    <label className="font-semibold text-gray-700 uppercase tracking-wider">
                                        {data.type === 'percentage' ? 'Nilai Persentase (%)' : 'Jumlah Potongan (Rp)'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="any"
                                        placeholder={data.type === 'percentage' ? '10' : '50000'}
                                        value={data.value}
                                        onChange={e => setData('value', e.target.value)}
                                        className="w-full bg-white border border-gray-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-gray-800"
                                    />
                                    {errors.value && <p className="text-red-500 mt-1 font-semibold">{errors.value}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Min Spend */}
                                <div className="space-y-1">
                                    <label className="font-semibold text-gray-700 uppercase tracking-wider">Minimal Belanja (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={data.min_spend}
                                        onChange={e => setData('min_spend', e.target.value)}
                                        className="w-full bg-white border border-gray-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-gray-800"
                                    />
                                    {errors.min_spend && <p className="text-red-500 mt-1 font-semibold">{errors.min_spend}</p>}
                                </div>

                                {/* Expires At */}
                                <div className="space-y-1">
                                    <label className="font-semibold text-gray-700 uppercase tracking-wider">Tanggal Kadaluarsa</label>
                                    <input
                                        type="datetime-local"
                                        value={data.expires_at}
                                        onChange={e => setData('expires_at', e.target.value)}
                                        className="w-full bg-white border border-gray-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-sans"
                                    />
                                    {errors.expires_at && <p className="text-red-500 mt-1 font-semibold">{errors.expires_at}</p>}
                                </div>
                            </div>

                            {/* Status Active */}
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <label htmlFor="is_active" className="font-semibold text-gray-700 uppercase tracking-wider select-none cursor-pointer">
                                    Kupon Aktif & Bisa Digunakan
                                </label>
                                {errors.is_active && <p className="text-red-500 mt-1 font-semibold">{errors.is_active}</p>}
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Kupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
