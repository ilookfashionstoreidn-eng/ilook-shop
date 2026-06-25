import React, { useState, useEffect, useRef } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    MapPin,
    Truck,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    Copy,
    RefreshCw,
    Shield,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import axios from 'axios';

export default function OrderDetail({ order: initialOrder, midtransClientKey, midtransSnapUrl }) {
    const [order, setOrder] = useState(initialOrder);
    const [retryLoading, setRetryLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const snapScriptLoaded = useRef(false);

    // Tracking states
    const [trackingData, setTrackingData] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const [trackingError, setTrackingError] = useState(null);

    const fetchTracking = async () => {
        if (!order.shipping?.tracking_number) return;
        setLoadingTracking(true);
        setTrackingError(null);
        try {
            const res = await axios.get(`/my-orders/${order.id}/tracking`);
            if (res.data?.success) {
                setTrackingData(res.data.data);
            } else {
                setTrackingError(res.data?.message || 'Gagal mengambil data pelacakan.');
            }
        } catch (err) {
            console.error(err);
            setTrackingError(err.response?.data?.message || 'Terjadi kesalahan saat melacak paket.');
        } finally {
            setLoadingTracking(false);
        }
    };

    // Auto-fetch tracking if tracking number exists
    useEffect(() => {
        if (order.shipping?.tracking_number) {
            fetchTracking();
        }
    }, [order.id, order.shipping?.tracking_number]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });

    // Load Midtrans Snap.js
    useEffect(() => {
        if (snapScriptLoaded.current || !midtransSnapUrl) return;
        const existing = document.getElementById('midtrans-snap-script');
        if (existing) { snapScriptLoaded.current = true; return; }

        const script = document.createElement('script');
        script.id = 'midtrans-snap-script';
        script.src = midtransSnapUrl;
        if (midtransClientKey) script.setAttribute('data-client-key', midtransClientKey);
        script.onload = () => { snapScriptLoaded.current = true; };
        document.head.appendChild(script);
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Sync status dari Midtrans
    const handleSyncStatus = async () => {
        setSyncing(true);
        try {
            const res = await axios.get(`/orders/${order.id}/payment/status`);
            if (res.data?.is_paid && order.payment_status !== 'paid') {
                router.reload();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSyncing(false);
        }
    };

    // Retry payment via Midtrans Snap
    const handleRetryPayment = async () => {
        setRetryLoading(true);
        try {
            const res = await axios.post(`/orders/${order.id}/payment/initiate`);
            if (res.data?.success && res.data?.snap_token && window.snap) {
                window.snap.pay(res.data.snap_token, {
                    onSuccess: () => router.reload(),
                    onPending: () => router.reload(),
                    onError: (r) => console.error('Payment error:', r),
                    onClose: () => {},
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRetryLoading(false);
        }
    };

    const statusMap = {
        pending_payment: { label: 'Menunggu Pembayaran', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, step: 1 },
        paid:            { label: 'Lunas — Menunggu Proses', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2, step: 2 },
        processing:      { label: 'Sedang Diproses', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: RefreshCw, step: 3 },
        shipped:         { label: 'Dalam Pengiriman', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck, step: 4 },
        delivered:       { label: 'Terkirim', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2, step: 5 },
        completed:       { label: 'Pesanan Selesai', color: 'text-green-700 bg-green-100 border-green-300', icon: CheckCircle2, step: 6 },
        cancelled:       { label: 'Dibatalkan', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle, step: 0 },
    };

    const currentStatus = statusMap[order.status] || statusMap['pending_payment'];
    const StatusIcon = currentStatus.icon;

    const steps = [
        { step: 1, label: 'Pesanan Dibuat' },
        { step: 2, label: 'Pembayaran Lunas' },
        { step: 3, label: 'Diproses Admin' },
        { step: 4, label: 'Dalam Pengiriman' },
        { step: 5, label: 'Terkirim' },
    ];

    const isCancelled = order.status === 'cancelled';
    const currentStep = currentStatus.step;

    return (
        <StorefrontLayout>
            <Head title={`Detail Pesanan ${order.order_number}`} />

            <div className="px-4 sm:px-10 py-10 max-w-[1100px] mx-auto space-y-6">

                {/* Back + Title */}
                <div className="flex items-center gap-3">
                    <Link
                        href={route('storefront.my-orders')}
                        className="p-2 border border-[#E0E0E0] hover:border-[#212121] transition-colors text-[#747878] hover:text-[#212121]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-base font-extrabold tracking-widest text-[#212121] uppercase">Detail Pesanan</h1>
                        <p className="text-[9px] text-[#747878] mt-0.5 flex items-center gap-1">
                            <span>{order.order_number}</span>
                            <button onClick={() => handleCopy(order.order_number)} className="ml-1 text-[#747878] hover:text-[#212121]">
                                {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`flex items-center justify-between p-4 border ${currentStatus.color} rounded-none flex-wrap gap-3`}>
                    <div className="flex items-center gap-3">
                        <StatusIcon className="w-5 h-5" />
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-widest">{currentStatus.label}</p>
                            <p className="text-[10px] mt-0.5 opacity-75">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {order.payment_status !== 'paid' && !isCancelled && (
                            <>
                                <button
                                    onClick={handleSyncStatus}
                                    disabled={syncing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-current text-[10px] font-bold uppercase tracking-wider hover:bg-white/50 transition-all disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                                    {syncing ? 'Mengecek...' : 'Cek Status'}
                                </button>
                                <button
                                    id="btn-retry-payment"
                                    onClick={handleRetryPayment}
                                    disabled={retryLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#212121] text-white text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {retryLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                                    Bayar Sekarang
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress Steps */}
                {!isCancelled && (
                    <div className="bg-white border border-[#E0E0E0] p-5">
                        <div className="flex items-center">
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.step}>
                                    <div className="flex flex-col items-center gap-1.5 flex-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all ${
                                            currentStep >= s.step
                                                ? 'bg-[#212121] border-[#212121] text-white'
                                                : 'border-[#E0E0E0] bg-white text-[#747878]'
                                        }`}>
                                            {currentStep > s.step ? <CheckCircle2 className="w-3 h-3" /> : s.step}
                                        </div>
                                        <span className={`text-[8px] font-bold text-center leading-tight ${currentStep >= s.step ? 'text-[#212121]' : 'text-[#747878]'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`h-0.5 flex-1 mb-5 transition-all ${currentStep > s.step ? 'bg-[#212121]' : 'bg-[#E0E0E0]'}`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* LEFT: Items + Shipping Info */}
                    <div className="md:col-span-2 space-y-5">
                        {/* Items */}
                        <div className="bg-white border border-[#E0E0E0]">
                            <div className="px-5 py-3.5 border-b border-[#E0E0E0] flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#212121]" />
                                <span className="text-xs font-extrabold uppercase tracking-widest text-[#212121]">Item Pesanan</span>
                            </div>
                            <div className="divide-y divide-[#E0E0E0]">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[#212121] uppercase tracking-wider truncate">{item.product_name}</p>
                                            <p className="text-[10px] text-[#747878] mt-0.5">
                                                Varian: {item.variant_label} &nbsp;·&nbsp; Qty: {item.quantity}
                                            </p>
                                            <p className="text-[10px] text-[#747878]">
                                                Harga satuan: {formatCurrency(item.unit_price)}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-extrabold text-[#212121]">
                                                {formatCurrency(item.subtotal || item.unit_price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Info */}
                        {order.shipping && (
                            <div className="bg-white border border-[#E0E0E0]">
                                <div className="px-5 py-3.5 border-b border-[#E0E0E0] flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#212121]" />
                                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#212121]">Alamat Pengiriman</span>
                                </div>
                                <div className="px-5 py-4 text-xs space-y-1.5">
                                    <p className="font-bold text-[#212121]">{order.shipping.recipient_name}</p>
                                    <p className="text-[#747878]">{order.shipping.phone}</p>
                                    <p className="text-[#747878]">{order.shipping.address}</p>
                                    <p className="text-[#747878]">{order.shipping.city}, {order.shipping.province} {order.shipping.postal_code}</p>

                                    <div className="pt-2 mt-2 border-t border-[#E0E0E0] flex items-center gap-2 flex-wrap">
                                        <Truck className="w-3.5 h-3.5 text-[#212121]" />
                                        <span className="font-bold text-[#212121]">{order.shipping.courier?.toUpperCase()} {order.shipping.service}</span>
                                        {order.shipping.tracking_number && (
                                            <div className="flex items-center gap-1 ml-2">
                                                <span className="text-[10px] text-[#747878]">Resi:</span>
                                                <span className="text-[10px] font-extrabold text-[#530A0C]">{order.shipping.tracking_number}</span>
                                                <button onClick={() => handleCopy(order.shipping.tracking_number)} className="text-[#747878] hover:text-[#212121]">
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tracking Timeline */}
                        {order.shipping?.tracking_number && (
                            <div className="bg-white border border-[#E0E0E0]">
                                <div className="px-5 py-3.5 border-b border-[#E0E0E0] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-[#212121]" />
                                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#212121]">Lacak Pengiriman</span>
                                    </div>
                                    <button 
                                        onClick={fetchTracking} 
                                        disabled={loadingTracking}
                                        className="text-[10px] font-extrabold uppercase tracking-wider text-[#747878] hover:text-[#212121] flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${loadingTracking ? 'animate-spin' : ''}`} />
                                        {loadingTracking ? 'Memperbarui...' : 'Perbarui'}
                                    </button>
                                </div>

                                <div className="px-5 py-4">
                                    {loadingTracking && !trackingData ? (
                                        <div className="py-6 flex flex-col items-center justify-center gap-2 text-[#747878]">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#212121]" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Menghubungkan ke Kurir...</span>
                                        </div>
                                    ) : trackingError ? (
                                        <div className="py-4 text-center">
                                            <p className="text-xs text-red-600 font-bold">{trackingError}</p>
                                            <button 
                                                onClick={fetchTracking}
                                                className="mt-2 px-3 py-1.5 bg-[#212121] text-white text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all"
                                            >
                                                Coba Lagi
                                            </button>
                                        </div>
                                    ) : trackingData ? (
                                        <div className="space-y-4">
                                            {/* Summary */}
                                            <div className="p-3 bg-[#f9f9f9] border border-[#E0E0E0] text-[11px] flex justify-between items-center flex-wrap gap-2">
                                                <div>
                                                    <span className="text-[#747878] font-bold uppercase tracking-wider block text-[9px]">Status</span>
                                                    <span className={`font-extrabold tracking-widest text-xs ${
                                                        trackingData.summary?.status === 'DELIVERED' ? 'text-green-700' : 'text-[#530A0C]'
                                                    }`}>
                                                        {trackingData.summary?.status || 'DALAM PROSES'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[#747878] font-bold uppercase tracking-wider block text-[9px]">Resi / Kurir</span>
                                                    <span className="font-extrabold text-[#212121]">
                                                        {trackingData.summary?.waybill_number} ({trackingData.summary?.courier_name})
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Vertical Timeline */}
                                            <div className="relative border-l border-[#E0E0E0] ml-3 pl-5 py-2 space-y-5">
                                                {trackingData.history?.map((event, idx) => {
                                                    const isLatest = idx === 0;
                                                    return (
                                                        <div key={idx} className="relative">
                                                            {/* Dot indicator */}
                                                            <span className={`absolute -left-[26px] top-1.5 w-3.5 h-3.5 rounded-none flex items-center justify-center border ${
                                                                isLatest 
                                                                    ? 'bg-[#212121] border-[#212121]' 
                                                                    : 'bg-white border-[#E0E0E0]'
                                                            }`}>
                                                                {isLatest && <span className="w-1.5 h-1.5 bg-white" />}
                                                            </span>

                                                            <div>
                                                                <span className="text-[9px] font-bold text-[#747878] uppercase tracking-wider block">
                                                                    {event.date} &nbsp;·&nbsp; {event.time}
                                                                </span>
                                                                <p className={`text-xs mt-1 ${isLatest ? 'font-bold text-[#212121]' : 'text-[#747878]'}`}>
                                                                    {event.description}
                                                                </p>
                                                                {event.location && (
                                                                    <span className="mt-1 inline-block bg-[#f0f0f0] text-[#747878] text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                                                                        {event.location}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {trackingData.is_mock && (
                                                <p className="text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-200 p-2 text-center uppercase tracking-wider">
                                                    * Menampilkan data simulasi pelacakan kurir (demo mode)
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center text-[#747878] text-xs">
                                            Tidak ada riwayat pengiriman ditemukan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Payment Summary */}
                    <div className="space-y-5">
                        <div className="bg-white border border-[#E0E0E0]">
                            <div className="px-5 py-3.5 border-b border-[#E0E0E0] flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#212121]" />
                                <span className="text-xs font-extrabold uppercase tracking-widest text-[#212121]">Ringkasan Bayar</span>
                            </div>
                            <div className="px-5 py-4 space-y-2.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[#747878]">Subtotal</span>
                                    <span className="font-bold text-[#212121]">{formatCurrency(order.subtotal)}</span>
                                </div>
                                {order.coupon_discount > 0 && (
                                    <div className="flex justify-between text-green-700 font-semibold">
                                        <span>Potongan Kupon ({order.coupon_code})</span>
                                        <span>-{formatCurrency(order.coupon_discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-[#747878]">Ongkos Kirim</span>
                                    <span className="font-bold text-[#212121]">{formatCurrency(order.shipping_cost)}</span>
                                </div>
                                <div className="border-t border-[#E0E0E0] pt-2.5 flex justify-between items-baseline">
                                    <span className="font-bold text-[#212121]">Total</span>
                                    <span className="text-base font-extrabold text-[#530A0C]">{formatCurrency(order.total_amount)}</span>
                                </div>
                                {order.payment_method && (
                                    <div className="pt-2 border-t border-[#E0E0E0]">
                                        <p className="text-[10px] text-[#747878] uppercase tracking-wider">Metode Bayar</p>
                                        <p className="font-bold text-[#212121] mt-1">{order.payment_method}</p>
                                    </div>
                                )}

                                {/* Payment status badge */}
                                <div className={`mt-3 pt-3 border-t border-[#E0E0E0] flex items-center gap-2 ${
                                    order.payment_status === 'paid' ? 'text-green-700' : 'text-amber-600'
                                }`}>
                                    {order.payment_status === 'paid' ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {order.payment_status === 'paid' ? 'Pembayaran Lunas' : 'Menunggu Pembayaran'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security badge */}
                        <div className="flex items-center gap-2 p-3 border border-[#E0E0E0] bg-[#f9f9f9] text-[9px] text-[#747878]">
                            <Shield className="w-4 h-4 text-[#212121] flex-shrink-0" />
                            <span>Pembayaran diproses oleh <strong className="text-[#212121]">Midtrans</strong> — PCI DSS Certified</span>
                        </div>

                        {/* Back link */}
                        <Link
                            href={route('storefront.my-orders')}
                            className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#E0E0E0] text-[#747878] hover:text-[#212121] hover:border-[#212121] text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Kembali ke Pesanan Saya
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
