import React, { useEffect, useRef, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Clock,
    CreditCard,
    CheckCircle2,
    ArrowRight,
    Copy,
    Building2,
    Wallet,
    QrCode,
    Shield,
    RefreshCw,
} from 'lucide-react';
import axios from 'axios';

export default function OrderPending({ order, midtransClientKey, midtransSnapUrl }) {
    const snapScriptLoaded = useRef(false);
    const [retryLoading, setRetryLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pollingStatus, setPollingStatus] = useState('checking'); // checking | paid | pending | failed
    const pollingRef = useRef(null);

    // Auto-polling: cek status pembayaran setiap 5 detik
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get(`/orders/${order.id}/payment/status`);
                if (res.data?.is_paid) {
                    setPollingStatus('paid');
                    clearInterval(pollingRef.current);
                    // Auto-redirect ke success page
                    setTimeout(() => {
                        window.location.href = route('storefront.order.success', order.id);
                    }, 1500);
                }
            } catch (err) {
                console.error('Status check error:', err);
            }
        };

        // Cek langsung saat halaman dibuka
        checkStatus();
        // Lalu cek setiap 5 detik
        pollingRef.current = setInterval(checkStatus, 5000);

        return () => clearInterval(pollingRef.current);
    }, [order.id]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    // Load Midtrans Snap.js
    useEffect(() => {
        if (snapScriptLoaded.current || !midtransSnapUrl) return;

        const existingScript = document.getElementById('midtrans-snap-script');
        if (existingScript) {
            snapScriptLoaded.current = true;
            return;
        }

        const script = document.createElement('script');
        script.id = 'midtrans-snap-script';
        script.src = midtransSnapUrl || 'https://app.sandbox.midtrans.com/snap/snap.js';
        if (midtransClientKey) {
            script.setAttribute('data-client-key', midtransClientKey);
        }
        script.onload = () => {
            snapScriptLoaded.current = true;
        };
        document.head.appendChild(script);
    }, [midtransClientKey, midtransSnapUrl]);

    const handleRetryPayment = async () => {
        setRetryLoading(true);
        try {
            const res = await axios.post(`/orders/${order.id}/payment/initiate`);
            if (res.data?.success && res.data?.snap_token && window.snap) {
                window.snap.pay(res.data.snap_token, {
                    onSuccess: () => {
                        window.location.href = route('storefront.order.success', order.id);
                    },
                    onPending: () => {
                        window.location.reload();
                    },
                    onError: (result) => {
                        console.error('Payment error:', result);
                    },
                    onClose: () => {
                        console.log('Popup closed');
                    },
                });
            }
        } catch (err) {
            console.error('Retry payment error:', err);
        } finally {
            setRetryLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(order.order_number).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const statusSteps = [
        { label: 'Pesanan Dibuat', done: true },
        { label: 'Menunggu Pembayaran', done: order.payment_status !== 'unpaid', active: order.payment_status === 'unpaid' },
        { label: 'Pembayaran Dikonfirmasi', done: order.payment_status === 'paid' },
        { label: 'Diproses & Dikirim', done: ['shipped', 'delivered'].includes(order.status) },
    ];

    return (
        <StorefrontLayout>
            <Head title={`Pesanan ${order.order_number} — Menunggu Pembayaran`} />

            <div className="px-4 sm:px-10 py-10 max-w-[900px] mx-auto space-y-6">

                {/* Header */}
                <div className="border-b border-[#E0E0E0] pb-4">
                    <div className="flex items-center gap-3">
                        {pollingStatus === 'paid' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                            <Clock className="w-6 h-6 text-amber-500" />
                        )}
                        <div>
                            <h1 className="text-xl font-extrabold tracking-widest text-[#212121] uppercase">
                                {pollingStatus === 'paid' ? 'Pembayaran Dikonfirmasi!' : 'Menunggu Pembayaran'}
                            </h1>
                            <p className="text-[#747878] text-xs mt-0.5 flex items-center gap-1.5">
                                {pollingStatus === 'paid' ? (
                                    <span className="text-green-600 font-bold">✓ Mengalihkan ke halaman sukses...</span>
                                ) : (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                        <span>Sistem sedang memverifikasi pembayaran Anda secara otomatis...</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Number + Status */}
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-none space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#747878]">Nomor Pesanan</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-extrabold text-[#212121] tracking-wider">{order.order_number}</span>
                                <button
                                    onClick={handleCopy}
                                    className="text-[#747878] hover:text-[#212121] transition-colors"
                                    title="Salin nomor pesanan"
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#747878]">Total Pembayaran</p>
                            <p className="text-xl font-extrabold text-[#530A0C]">{formatCurrency(order.total_amount)}</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-1 pt-2">
                        {statusSteps.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex flex-col items-center gap-1 flex-1">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all ${
                                        step.done 
                                            ? 'bg-[#212121] border-[#212121] text-white' 
                                            : step.active 
                                                ? 'border-amber-400 bg-amber-50 text-amber-600 animate-pulse' 
                                                : 'border-[#E0E0E0] bg-white text-[#747878]'
                                    }`}>
                                        {step.done ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                                    </div>
                                    <span className={`text-[8px] font-bold text-center leading-tight ${step.active ? 'text-amber-600' : step.done ? 'text-[#212121]' : 'text-[#747878]'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < statusSteps.length - 1 && (
                                    <div className={`h-0.5 flex-1 mb-4 ${step.done ? 'bg-[#212121]' : 'bg-[#E0E0E0]'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Payment Methods */}
                    <div className="bg-white border border-[#E0E0E0] p-5 space-y-4">
                        <h2 className="text-sm font-extrabold text-[#212121] uppercase tracking-widest flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Selesaikan Pembayaran
                        </h2>

                        <p className="text-[11px] text-[#747878] leading-relaxed">
                            Klik tombol di bawah untuk melanjutkan ke halaman pembayaran Midtrans. Pilih metode yang sesuai:
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: Building2, label: 'Virtual Account', desc: 'BCA, BNI, BRI, Mandiri' },
                                { icon: Wallet, label: 'E-Wallet', desc: 'GoPay, OVO, Dana' },
                                { icon: QrCode, label: 'QRIS', desc: 'Semua dompet digital' },
                                { icon: CreditCard, label: 'Kartu Kredit', desc: 'Visa, Mastercard' },
                            ].map((m, i) => (
                                <div key={i} className="p-2.5 border border-[#E0E0E0] bg-[#f9f9f9] flex items-center gap-2">
                                    <m.icon className="w-4 h-4 text-[#212121] flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-wide text-[#212121]">{m.label}</p>
                                        <p className="text-[8px] text-[#747878]">{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Retry Payment Button */}
                        {order.payment_status !== 'paid' && (
                            <button
                                id="btn-retry-payment"
                                onClick={handleRetryPayment}
                                disabled={retryLoading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-none bg-[#212121] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {retryLoading ? (
                                    <><RefreshCw className="w-4 h-4 animate-spin" /><span>Menghubungi Gateway...</span></>
                                ) : (
                                    <><CreditCard className="w-4 h-4" /><span>Lanjutkan Pembayaran</span><ArrowRight className="w-3 h-3" /></>
                                )}
                            </button>
                        )}

                        {order.payment_status === 'paid' && (
                            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold rounded-none flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Pembayaran Sudah Dikonfirmasi
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-[9px] text-[#747878]">
                            <Shield className="w-3 h-3 flex-shrink-0" />
                            <span>Secured by <strong>Midtrans</strong> — PCI DSS Certified</span>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="bg-white border border-[#E0E0E0] p-5 space-y-4">
                        <h2 className="text-sm font-extrabold text-[#212121] uppercase tracking-widest">
                            Ringkasan Pesanan
                        </h2>

                        {/* Items */}
                        <div className="divide-y divide-[#E0E0E0] max-h-40 overflow-y-auto">
                            {order.items?.map((item) => (
                                <div key={item.id} className="py-2 flex justify-between items-start gap-2 text-[11px]">
                                    <div className="min-w-0">
                                        <p className="font-bold text-[#212121] truncate uppercase text-[10px] tracking-wider">{item.product_name}</p>
                                        <p className="text-[#747878]">{item.variant_name} × {item.quantity}</p>
                                    </div>
                                    <span className="font-bold text-[#212121] flex-shrink-0">{formatCurrency(item.unit_price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-[#E0E0E0] pt-3 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[#747878]">Subtotal</span>
                                <span className="font-bold text-[#212121]">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#747878]">Ongkos Kirim ({order.shipping?.courier?.toUpperCase()})</span>
                                <span className="font-bold text-[#212121]">{formatCurrency(order.shipping_cost)}</span>
                            </div>
                        </div>

                        <div className="border-t border-[#E0E0E0] pt-3 flex justify-between items-baseline">
                            <span className="font-bold text-[#212121] text-sm">Total</span>
                            <span className="font-extrabold text-[#530A0C] text-base">{formatCurrency(order.total_amount)}</span>
                        </div>

                        {/* Shipping info */}
                        {order.shipping && (
                            <div className="border-t border-[#E0E0E0] pt-3 text-[10px] text-[#747878] space-y-1">
                                <p className="font-bold text-[#212121] uppercase tracking-wider text-[9px]">Alamat Pengiriman</p>
                                <p className="font-bold text-[#212121]">{order.shipping.recipient_name}</p>
                                <p>{order.shipping.address}</p>
                                <p>{order.shipping.city}, {order.shipping.province}</p>
                                <p className="mt-1">Kurir: <strong className="text-[#212121]">{order.shipping.courier?.toUpperCase()} {order.shipping.service}</strong></p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                        href={route('storefront.home')}
                        className="flex items-center gap-2 px-5 py-2.5 border border-[#E0E0E0] bg-white text-[#747878] hover:text-[#212121] hover:border-[#212121] text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        Lanjut Belanja
                    </Link>
                    <p className="text-[10px] text-[#747878] flex items-center">
                        Pesanan akan diproses otomatis setelah pembayaran dikonfirmasi Midtrans.
                    </p>
                </div>
            </div>
        </StorefrontLayout>
    );
}
