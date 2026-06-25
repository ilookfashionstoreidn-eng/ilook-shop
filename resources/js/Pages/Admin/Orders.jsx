import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Search,
    ReceiptText,
    X,
    Eye,
    Truck,
    Printer,
    CornerUpLeft,
    CheckCircle,
    Package,
    ShieldCheck,
    Ban,
    RefreshCw,
} from 'lucide-react';

export default function Orders({ orders, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isResiOpen, setIsResiOpen] = useState(false);
    const [syncingGinee, setSyncingGinee] = useState(false);

    const handleSyncGinee = (orderId) => {
        setSyncingGinee(true);
        router.post(route('admin.orders.sync-ginee', orderId), {}, {
            onSuccess: (page) => {
                setSyncingGinee(false);
                // Refresh modal data with updated order
                const updatedOrder = page.props.orders.data.find(o => o.id === orderId);
                setSelectedOrder(updatedOrder || null);
            },
            onError: () => {
                setSyncingGinee(false);
            },
            onFinish: () => {
                setSyncingGinee(false);
            }
        });
    };

    // Form for resi input
    const resiForm = useForm({
        tracking_number: ''
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const tabs = [
        { id: 'all', name: 'Semua' },
        { id: 'pending_payment', name: 'Pending' },
        { id: 'paid', name: 'Lunas' },
        { id: 'processing', name: 'Diproses' },
        { id: 'shipped', name: 'Dikirim' },
        { id: 'delivered', name: 'Selesai' },
        { id: 'cancelled', name: 'Batal' },
        { id: 'returned', name: 'Retur' }
    ];

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleApplyFilters = (status = activeTab) => {
        router.get(route('admin.orders'), {
            search: searchTerm,
            status: status
        }, { preserveState: true });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        handleApplyFilters(tabId);
    };

    const handleResetSearch = () => {
        setSearchTerm('');
        router.get(route('admin.orders'), { status: activeTab });
    };

    const openDetailsModal = (order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const handleUpdateStatus = (orderId, nextStatus, nextPaymentStatus = null) => {
        router.put(route('admin.orders.update-status', orderId), {
            status: nextStatus,
            payment_status: nextPaymentStatus
        }, {
            onSuccess: (page) => {
                // If modal is open, refresh the selectedOrder data
                if (selectedOrder && selectedOrder.id === orderId) {
                    const updatedOrder = page.props.orders.data.find(o => o.id === orderId);
                    setSelectedOrder(updatedOrder || null);
                }
            }
        });
    };

    const openResiModal = (order) => {
        setSelectedOrder(order);
        resiForm.setData('tracking_number', order.shipping?.tracking_number || '');
        setIsResiOpen(true);
    };

    const handleSaveResi = (e) => {
        e.preventDefault();
        resiForm.put(route('admin.orders.update-resi', selectedOrder.id), {
            onSuccess: (page) => {
                setIsResiOpen(false);
                // Refresh order modal data
                const updatedOrder = page.props.orders.data.find(o => o.id === selectedOrder.id);
                setSelectedOrder(updatedOrder || null);
            }
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending_payment': return 'badge-amber';
            case 'paid': return 'badge-blue';
            case 'processing': return 'badge-indigo';
            case 'shipped': return 'badge-cyan';
            case 'delivered': return 'badge-green';
            case 'cancelled': return 'badge-red';
            case 'returned': return 'badge-purple';
            default: return 'badge-gray';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending_payment': return 'Menunggu Pembayaran';
            case 'paid': return 'Lunas (Menunggu Proses)';
            case 'processing': return 'Sedang Diproses';
            case 'shipped': return 'Sedang Dikirim';
            case 'delivered': return 'Selesai (Diterima)';
            case 'cancelled': return 'Dibatalkan';
            case 'returned': return 'Barang Diretur';
            default: return status;
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Pesanan Masuk" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Daftar Pesanan Toko</h1>
                    <p className="text-gray-500 text-sm mt-0.5 font-medium">Validasi status pembayaran, input nomor resi, lacak status pengiriman Raja Ongkir, dan cetak invoice.</p>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 pb-px overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-emerald-650 text-emerald-600 bg-emerald-50'
                                    : 'border-transparent text-gray-400 hover:text-gray-650'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Filters Search Bar */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor order/invoice, nama penerima, no handphone..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl pl-10 pr-10 py-2.5 text-gray-800 placeholder-gray-400"
                        />
                        {searchTerm && (
                            <button onClick={handleResetSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => handleApplyFilters()}
                        className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm transition-all"
                    >
                        Cari
                    </button>
                </div>

                {/* Orders List Table */}
                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto min-w-full">
                        <table className="min-w-full admin-table">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left">No. Invoice</th>
                                    <th className="px-6 py-4 text-left">Tanggal Order</th>
                                    <th className="px-6 py-4 text-left">Penerima</th>
                                    <th className="px-6 py-4 text-left">Metode Bayar</th>
                                    <th className="px-6 py-4 text-left">Total</th>
                                    <th className="px-6 py-4 text-left">Status Pesanan</th>
                                    <th className="px-6 py-4 text-left">Status Bayar</th>
                                    <th className="px-6 py-4 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-400 font-medium">
                                            Tidak ada pesanan ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openDetailsModal(order)}
                                                    className="font-mono font-bold text-emerald-600 hover:text-emerald-700 text-left"
                                                >
                                                    {order.order_number}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-gray-450 text-xs">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {order.shipping?.recipient_name || order.user?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {order.payment_method || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getStatusClass(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.payment_status === 'paid' && (
                                                    <span className="badge badge-green">Lunas</span>
                                                )}
                                                {order.payment_status === 'unpaid' && (
                                                    <span className="badge badge-amber">Belum</span>
                                                )}
                                                {order.payment_status === 'failed' && (
                                                    <span className="badge badge-red">Gagal</span>
                                                )}
                                                {order.payment_status === 'expired' && (
                                                    <span className="badge badge-gray">Kedaluwarsa</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openDetailsModal(order)}
                                                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ORDER DETAILS MODAL */}
            {isDetailsOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)} />

                    <div className="relative w-full max-w-3xl rounded-2xl border border-gray-150 bg-white p-6 shadow-2xl z-10 flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 font-outfit">Detail Pesanan</h2>
                                <span className="text-xs text-gray-400 font-mono">INVOICE: {selectedOrder.order_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleSyncGinee(selectedOrder.id)}
                                    disabled={syncingGinee}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 shadow-sm"
                                >
                                    <RefreshCw className={`w-4 h-4 ${syncingGinee ? 'animate-spin' : ''}`} />
                                    <span>{syncingGinee ? 'Syncing...' : 'Sync Ginee'}</span>
                                </button>
                                <a
                                    href={route('admin.orders.invoice', selectedOrder.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Invoice</span>
                                </a>
                                <button onClick={() => setIsDetailsOpen(false)} className="p-1 text-gray-400 hover:text-gray-650 rounded-lg hover:bg-gray-50 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scroll Content */}
                        <div className="flex-1 overflow-y-auto space-y-6 text-gray-600 pr-1 text-sm">
                            {/* Workflow Actions Banner */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-400 font-semibold uppercase">Status Saat Ini:</span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`badge ${getStatusClass(selectedOrder.status)}`}>
                                            {getStatusLabel(selectedOrder.status)}
                                        </span>
                                        {selectedOrder.shipping?.tracking_number && (
                                            <span className="text-xs text-gray-500 font-mono">RESI: {selectedOrder.shipping.tracking_number}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic transition buttons */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {selectedOrder.status === 'paid' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-all"
                                        >
                                            <Package className="w-4 h-4" />
                                            Proses Pesanan
                                        </button>
                                    )}

                                    {selectedOrder.status === 'processing' && (
                                        <button
                                            onClick={() => openResiModal(selectedOrder)}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
                                        >
                                            <Truck className="w-4 h-4" />
                                            Kirim & Input Resi
                                        </button>
                                    )}

                                    {selectedOrder.status === 'shipped' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            Selesaikan Pesanan
                                        </button>
                                    )}

                                    {['pending_payment', 'paid', 'processing'].includes(selectedOrder.status) && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Stok akan otomatis dikembalikan ke inventori.')) {
                                                    handleUpdateStatus(selectedOrder.id, 'cancelled', 'failed');
                                                }
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-red-200 bg-red-50 text-red-650 hover:bg-red-100 transition-all"
                                        >
                                            <Ban className="w-4 h-4" />
                                            Batalkan Pesanan
                                        </button>
                                    )}

                                    {selectedOrder.status === 'delivered' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'returned')}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-purple-250 bg-purple-50 text-purple-650 hover:bg-purple-100 transition-all"
                                        >
                                            <CornerUpLeft className="w-4 h-4" />
                                            Ajukan Retur
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Two Column details grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Buyer Details Card */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                                    <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Informasi Pembeli</h3>
                                    <div className="space-y-1 text-gray-600">
                                        <div><span className="text-gray-400 text-xs">Penerima:</span> <span className="font-semibold">{selectedOrder.shipping?.recipient_name || selectedOrder.user?.name}</span></div>
                                        <div><span className="text-gray-400 text-xs">Handphone:</span> <span>{selectedOrder.shipping?.phone || selectedOrder.user?.phone}</span></div>
                                        <div><span className="text-gray-400 text-xs">Email:</span> <span>{selectedOrder.user?.email || '-'}</span></div>
                                    </div>
                                </div>

                                {/* Shipping Details Card */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                                    <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Alamat Pengiriman (Raja Ongkir)</h3>
                                    <div className="space-y-1 text-xs text-gray-650">
                                        <p className="font-medium text-gray-850">{selectedOrder.shipping?.recipient_name}</p>
                                        <p>{selectedOrder.shipping?.address}</p>
                                        <p>{selectedOrder.shipping?.city}, {selectedOrder.shipping?.province} - {selectedOrder.shipping?.postal_code}</p>
                                        <p className="pt-2 text-gray-500 font-semibold uppercase">Kurir: {selectedOrder.shipping?.courier?.toUpperCase()} ({selectedOrder.shipping?.service})</p>
                                    </div>
                                </div>
                            </div>

                            {/* Item details list */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4">
                                <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Daftar Barang Belanja</h3>
                                <div className="divide-y divide-gray-250 space-y-3">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs flex-shrink-0">
                                                    {item.variant?.product?.images && item.variant.product.images[0] ? (
                                                        <img src={item.variant.product.images[0]} alt={item.product_name} className="w-full h-full object-cover rounded" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-gray-450" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-xs">{item.product_name}</h4>
                                                    <span className="text-[10px] text-emerald-600 font-bold">Varian: {item.variant_label}</span>
                                                    <div className="text-[10px] text-gray-400 font-mono">SKU: {item.variant?.sku}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-gray-450 text-xs">{item.quantity} x {formatCurrency(item.unit_price)}</span>
                                                <div className="font-bold text-gray-800 text-xs">{formatCurrency(item.subtotal)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Accounting totals block */}
                                <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-right">
                                    <div className="flex justify-between md:justify-end gap-10"><span className="text-gray-400">Subtotal Belanja:</span> <span className="font-semibold text-gray-700">{formatCurrency(selectedOrder.subtotal)}</span></div>
                                    {selectedOrder.coupon_discount > 0 && (
                                        <div className="flex justify-between md:justify-end gap-10 text-green-700 font-semibold">
                                            <span>Potongan Kupon ({selectedOrder.coupon_code}):</span>
                                            <span>-{formatCurrency(selectedOrder.coupon_discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between md:justify-end gap-10"><span className="text-gray-400">Ongkos Kirim Raja Ongkir:</span> <span className="font-semibold text-gray-700">{formatCurrency(selectedOrder.shipping_cost)}</span></div>
                                    <div className="flex justify-between md:justify-end gap-10 border-t border-gray-200 pt-2"><span className="text-gray-500 font-bold">Total Transaksi:</span> <span className="text-sm font-bold text-emerald-600">{formatCurrency(selectedOrder.total_amount)}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 pt-4 mt-4 flex justify-end">
                            <button
                                onClick={() => setIsDetailsOpen(false)}
                                className="px-5 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INPUT TRACKING NUMBER (RESI) MODAL */}
            {isResiOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsResiOpen(false)} />

                    <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-lg font-bold text-gray-900 font-outfit">Input Resi Pengiriman</h2>
                            <button onClick={() => setIsResiOpen(false)} className="p-1 text-gray-400 hover:text-gray-655 rounded-lg hover:bg-gray-50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveResi} className="space-y-4 text-gray-650 text-sm">
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
                                <div><span className="text-gray-400">Order:</span> <span className="font-semibold text-gray-800">{selectedOrder.order_number}</span></div>
                                <div><span className="text-gray-400">Kurir Tujuan:</span> <span className="font-bold text-emerald-600 uppercase">{selectedOrder.shipping?.courier} ({selectedOrder.shipping?.service})</span></div>
                                <div><span className="text-gray-400">Penerima:</span> <span className="text-gray-700">{selectedOrder.shipping?.recipient_name}</span></div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-450 uppercase">Nomor Resi Pengiriman (Waybill)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: JNE12903810238"
                                    value={resiForm.data.tracking_number}
                                    onChange={e => resiForm.setData('tracking_number', e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 font-mono uppercase"
                                />
                                {resiForm.errors.tracking_number && <p className="text-xs text-red-500 mt-1">{resiForm.errors.tracking_number}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsResiOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={resiForm.processing}
                                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50"
                                >
                                    Konfirmasi Pengiriman
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
