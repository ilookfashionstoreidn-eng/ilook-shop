import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Search,
    Boxes,
    ArrowUpRight,
    ArrowDownRight,
    Edit,
    X,
    FileText,
    History,
} from 'lucide-react';

export default function Stocks({ stocks, stockLogs, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const { data, setData, put, errors, reset, processing } = useForm({
        stock: 0,
        reason: 'Penyesuaian Manual',
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleApplySearch = () => {
        router.get(route('admin.stocks'), { search: searchTerm }, { preserveState: true });
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        router.get(route('admin.stocks'));
    };

    const openAdjustModal = (variant) => {
        setSelectedVariant(variant);
        setData({
            stock: variant.stock,
            reason: 'Penyesuaian Manual',
        });
        setIsModalOpen(true);
    };

    const handleSaveStock = (e) => {
        e.preventDefault();
        put(route('admin.stocks.update', selectedVariant.id), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Stok iLook" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Inventori & Stok</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Pantau jumlah stok masing-masing varian secara real-time, lakukan koreksi stok, dan lihat riwayat log mutasi.</p>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stocks List Card (Left/Center) */}
                    <div className="admin-card p-6 lg:col-span-2 flex flex-col gap-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Stok per Varian</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Daftar item siap jual dan stok fisiknya</p>
                            </div>

                            {/* Search bar */}
                            <div className="relative flex items-center gap-2">
                                <Search className="absolute left-3 w-4 h-4 text-gray-450" />
                                <input
                                    type="text"
                                    placeholder="Cari SKU, nama..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
                                    className="bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs rounded-xl pl-9 pr-8 py-2 text-gray-800 w-full sm:w-56"
                                />
                                {searchTerm && (
                                    <button onClick={handleResetSearch} className="absolute right-3 text-gray-400 hover:text-gray-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stocks Table */}
                        <div className="overflow-x-auto min-w-full">
                            <table className="min-w-full admin-table">
                                <thead>
                                    <tr>
                                        <th className="text-left">Varian SKU</th>
                                        <th className="text-left">Produk</th>
                                        <th className="text-left">Varian</th>
                                        <th className="text-left">Stok Saat Ini</th>
                                        <th className="text-right">Koreksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stocks.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-6 text-center text-gray-400 font-medium">Tidak ada item ditemukan.</td>
                                        </tr>
                                    ) : (
                                        stocks.data.map((item) => (
                                            <tr key={item.id}>
                                                <td className="font-mono text-xs text-gray-500 font-semibold">{item.sku}</td>
                                                <td className="font-medium text-gray-800">{item.product ? item.product.name : 'N/A'}</td>
                                                <td className="text-gray-500">{item.name}</td>
                                                <td className="font-semibold">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.stock === 0 ? 'bg-red-50 text-red-600 border border-red-100' : item.stock <= 5 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                        {item.stock} Pcs
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => openAdjustModal(item)}
                                                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all shadow-sm"
                                                    >
                                                        Koreksi
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {stocks.links && stocks.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-400">
                                    Halaman {stocks.current_page} dari {stocks.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    {stocks.links.filter(l => l.url).map((link) => (
                                        <button
                                            key={link.label}
                                            onClick={() => router.get(link.url, { search: searchTerm }, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${link.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stock Mutation Log Cards (Right Panel) */}
                    <div className="admin-card p-6 flex flex-col gap-4 max-h-[80vh] overflow-hidden">
                        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-650" />
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Log Mutasi Stok</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Riwayat keluar masuk barang (30 Terakhir)</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {stockLogs.length === 0 ? (
                                <div className="text-center text-gray-450 text-xs py-8">Belum ada mutasi stok tercatat.</div>
                            ) : (
                                stockLogs.map((log) => {
                                    const isPositive = log.change > 0;
                                    return (
                                        <div key={log.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-gray-500 font-semibold">{log.sku}</span>
                                                <span className={`flex items-center font-bold px-1.5 py-0.5 rounded text-[10px] ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-650 border border-red-100'}`}>
                                                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                                    {isPositive ? '+' : ''}{log.change}
                                                </span>
                                            </div>

                                            <div className="text-gray-700">
                                                {log.product_name} · <span className="text-gray-500">{log.variant_name}</span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 border-t border-gray-200/50 pt-2 text-[10px] text-gray-400">
                                                <span>Alasan: <span className="text-gray-600 font-medium">{log.reason}</span></span>
                                                <span>
                                                    {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ADJUST STOCK MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-lg font-bold text-gray-900 font-outfit">
                                Koreksi Stok Varian
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {selectedVariant && (
                            <form onSubmit={handleSaveStock} className="space-y-4 text-gray-650 text-sm">
                                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                                    <div className="font-semibold text-gray-800">{selectedVariant.product?.name}</div>
                                    <div className="text-xs text-gray-500">Varian: <span className="text-emerald-600 font-bold">{selectedVariant.name}</span></div>
                                    <div className="text-[10px] font-mono text-gray-400">SKU: {selectedVariant.sku}</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-450 uppercase">Jumlah Stok Baru</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={data.stock}
                                        onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 font-bold"
                                    />
                                    {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-450 uppercase">Alasan Penyesuaian</label>
                                    <select
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-850"
                                    >
                                        <option value="Penyesuaian Manual">Penyesuaian Manual (Stocktake)</option>
                                        <option value="Barang Rusak / Defect">Barang Rusak / Defect</option>
                                        <option value="Restock Penjual">Restock Barang Masuk</option>
                                        <option value="Ginee Sync Update">Sinkronisasi Omnichannel Ginee</option>
                                    </select>
                                    {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                                        className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50"
                                    >
                                        Simpan Stok
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
