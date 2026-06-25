import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Sparkles,
    Calendar,
    Settings as SettingsIcon,
    DollarSign,
    Zap
} from 'lucide-react';

export default function FlashSales({ flashSaleProducts, availableProducts, settings }) {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentFlashId, setCurrentFlashId] = useState(null);

    // Global Settings Form
    const settingsForm = useForm({
        flash_sale_is_active: settings.flash_sale_is_active || false,
        flash_sale_start_time: settings.flash_sale_start_time ? settings.flash_sale_start_time.substring(0, 16) : '',
        flash_sale_end_time: settings.flash_sale_end_time ? settings.flash_sale_end_time.substring(0, 16) : '',
    });

    // Product Form (Add / Edit)
    const productForm = useForm({
        product_id: '',
        discount_type: 'percentage',
        discount_value: '',
    });

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('admin.flash-sales.settings.update'), {
            preserveScroll: true,
        });
    };

    const openCreateModal = () => {
        productForm.reset();
        setEditMode(false);
        setCurrentFlashId(null);
        setIsProductModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setCurrentFlashId(item.id);
        productForm.setData({
            product_id: item.product_id,
            discount_type: item.discount_type,
            discount_value: item.discount_value,
        });
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = (e) => {
        e.preventDefault();
        if (editMode) {
            productForm.put(route('admin.flash-sales.update', currentFlashId), {
                onSuccess: () => {
                    setIsProductModalOpen(false);
                    productForm.reset();
                },
            });
        } else {
            productForm.post(route('admin.flash-sales.store'), {
                onSuccess: () => {
                    setIsProductModalOpen(false);
                    productForm.reset();
                },
            });
        }
    };

    const handleDeleteProduct = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini dari Flash Sale?')) {
            router.delete(route('admin.flash-sales.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // Calculate final preview price for the modal
    const getPreviewPrice = () => {
        if (!productForm.data.product_id) return 0;
        const selectedProd = editMode 
            ? flashSaleProducts.find(item => item.product_id === parseInt(productForm.data.product_id))?.product
            : availableProducts.find(p => p.id === parseInt(productForm.data.product_id));

        if (!selectedProd) return 0;

        const base = parseFloat(selectedProd.base_price);
        const val = parseFloat(productForm.data.discount_value) || 0;

        if (productForm.data.discount_type === 'percentage') {
            return Math.max(0, base * (1 - val / 100));
        } else {
            return Math.max(0, base - val);
        }
    };

    const getSelectedProductBasePrice = () => {
        if (!productForm.data.product_id) return 0;
        const selectedProd = editMode 
            ? flashSaleProducts.find(item => item.product_id === parseInt(productForm.data.product_id))?.product
            : availableProducts.find(p => p.id === parseInt(productForm.data.product_id));
        return selectedProd ? parseFloat(selectedProd.base_price) : 0;
    };

    return (
        <AdminLayout>
            <Head title="Kelola Flash Sale iLook" />

            <div className="flex flex-col gap-8 pb-10">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Flash Sale</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Atur produk promosi dengan potongan harga berwaktu terbatas.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Global configurations */}
                    <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm h-fit">
                        <div className="flex items-center gap-2 mb-5 border-b border-gray-100 pb-3">
                            <SettingsIcon className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-base font-semibold text-gray-900">Pengaturan Kampanye</h2>
                        </div>

                        <form onSubmit={handleSaveSettings} className="space-y-5">
                            {/* Is Active Toggle */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Status Kampanye
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => settingsForm.setData('flash_sale_is_active', !settingsForm.data.flash_sale_is_active)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settingsForm.data.flash_sale_is_active ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                settingsForm.data.flash_sale_is_active ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        {settingsForm.data.flash_sale_is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Mengaktifkan/menonaktifkan seluruh tampilan banner Flash Sale di storefront secara global.</p>
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Waktu Mulai
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        value={settingsForm.data.flash_sale_start_time}
                                        onChange={e => settingsForm.setData('flash_sale_start_time', e.target.value)}
                                        className="pl-9 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                {settingsForm.errors.flash_sale_start_time && (
                                    <p className="text-red-500 text-xs mt-1">{settingsForm.errors.flash_sale_start_time}</p>
                                )}
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Waktu Selesai
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        value={settingsForm.data.flash_sale_end_time}
                                        onChange={e => settingsForm.setData('flash_sale_end_time', e.target.value)}
                                        className="pl-9 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                {settingsForm.errors.flash_sale_end_time && (
                                    <p className="text-red-500 text-xs mt-1">{settingsForm.errors.flash_sale_end_time}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="w-full bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                {settingsForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Flash Sale Products */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                                <h2 className="text-base font-semibold text-gray-900">Daftar Produk Flash Sale</h2>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Produk</span>
                            </button>
                        </div>

                        {/* Flash Sale items list */}
                        {flashSaleProducts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                                <Sparkles className="w-12 h-12 text-gray-300 mb-3" />
                                <h4 className="text-base font-semibold text-gray-700">Belum Ada Produk Flash Sale</h4>
                                <p className="text-sm text-gray-400 max-w-sm mt-1">Tambahkan produk dari katalog iLook Anda untuk dimasukkan ke dalam program potongan harga khusus.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-semibold text-xs tracking-wider uppercase">
                                            <th className="py-3 px-6">Produk</th>
                                            <th className="py-3 px-6 text-right">Harga Dasar</th>
                                            <th className="py-3 px-6 text-center">Diskon</th>
                                            <th className="py-3 px-6 text-right">Harga Akhir</th>
                                            <th className="py-3 px-6 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {flashSaleProducts.map((item) => {
                                            const originalPrice = parseFloat(item.product.base_price);
                                            const finalPrice = item.discount_type === 'percentage' 
                                                ? originalPrice * (1 - item.discount_value / 100) 
                                                : Math.max(0, originalPrice - item.discount_value);

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4.5 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-12 bg-gray-50 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                                                                <img 
                                                                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60'} 
                                                                    alt={item.product.name} 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</h4>
                                                                <p className="text-[11px] text-gray-400 mt-0.5">{item.product.category?.name || 'Umum'} • SKU: {item.product.sku || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4.5 px-6 text-right font-medium">
                                                        {formatCurrency(originalPrice)}
                                                    </td>
                                                    <td className="py-4.5 px-6 text-center">
                                                        {item.discount_type === 'percentage' ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                                                {item.discount_value}%
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                                                                -{formatCurrency(item.discount_value)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4.5 px-6 text-right font-bold text-emerald-600">
                                                        {formatCurrency(finalPrice)}
                                                    </td>
                                                    <td className="py-4.5 px-6 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => openEditModal(item)}
                                                                className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                                title="Edit diskon"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(item.id)}
                                                                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                title="Hapus dari Flash Sale"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: Add/Edit Flash Sale Product */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 text-base">
                                {editMode ? 'Edit Diskon Flash Sale' : 'Tambah Produk Flash Sale'}
                            </h3>
                            <button
                                onClick={() => setIsProductModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                            {/* Product Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Pilih Produk
                                </label>
                                {editMode ? (
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-semibold">
                                        {flashSaleProducts.find(item => item.product_id === parseInt(productForm.data.product_id))?.product.name}
                                    </div>
                                ) : (
                                    <select
                                        value={productForm.data.product_id}
                                        onChange={e => productForm.setData('product_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        required
                                    >
                                        <option value="">-- Pilih Produk Catalog --</option>
                                        {availableProducts.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({formatCurrency(p.base_price)})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {productForm.errors.product_id && (
                                    <p className="text-red-500 text-xs mt-1">{productForm.errors.product_id}</p>
                                )}
                            </div>

                            {/* Discount Type */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Tipe Potongan Harga
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => productForm.setData('discount_type', 'percentage')}
                                        className={`px-4 py-2 border text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                            productForm.data.discount_type === 'percentage'
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Persentase (%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => productForm.setData('discount_type', 'fixed')}
                                        className={`px-4 py-2 border text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                            productForm.data.discount_type === 'fixed'
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Nominal Tetap (Rp)
                                    </button>
                                </div>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    {productForm.data.discount_type === 'percentage' ? 'Persen Diskon (%)' : 'Besaran Potongan (Rp)'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder={productForm.data.discount_type === 'percentage' ? 'Contoh: 15' : 'Contoh: 25000'}
                                    value={productForm.data.discount_value}
                                    onChange={e => productForm.setData('discount_value', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                                {productForm.errors.discount_value && (
                                    <p className="text-red-500 text-xs mt-1">{productForm.errors.discount_value}</p>
                                )}
                            </div>

                            {/* Price Preview Card */}
                            {productForm.data.product_id && (
                                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2 mt-4 text-xs font-medium">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Harga Awal:</span>
                                        <span className="font-semibold text-gray-800">{formatCurrency(getSelectedProductBasePrice())}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Potongan Diskon:</span>
                                        <span className="font-semibold text-rose-600">
                                            {productForm.data.discount_type === 'percentage' 
                                                ? `${productForm.data.discount_value || 0}%` 
                                                : formatCurrency(productForm.data.discount_value || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200/60 pt-2 mt-1">
                                        <span>Harga Flash Sale:</span>
                                        <span className="text-emerald-600">{formatCurrency(getPreviewPrice())}</span>
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-3 border-t border-gray-100 pt-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="flex-1 border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={productForm.processing}
                                    className="flex-1 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {productForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
