import React, { useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Package,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    ShoppingBag,
    RefreshCw,
} from 'lucide-react';

export default function MyOrders({ orders }) {
    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

    const getStatusBadge = (status, paymentStatus) => {
        const map = {
            pending_payment: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
            paid:            { label: 'Lunas — Menunggu Proses', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
            processing:      { label: 'Sedang Diproses', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: RefreshCw },
            shipped:         { label: 'Dalam Pengiriman', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Truck },
            delivered:       { label: 'Terkirim', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
            completed:       { label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
            cancelled:       { label: 'Dibatalkan', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
        };
        const badge = map[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Package };
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const map = {
            paid:   { label: 'Lunas', color: 'text-green-700 bg-green-50 border-green-200' },
            unpaid: { label: 'Belum Bayar', color: 'text-amber-700 bg-amber-50 border-amber-200' },
            failed: { label: 'Gagal', color: 'text-red-700 bg-red-50 border-red-200' },
        };
        const badge = map[paymentStatus] || { label: paymentStatus, color: 'text-gray-600 bg-gray-50 border-gray-200' };
        return (
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <StorefrontLayout>
            <Head title="Pesanan Saya — iLook Fashion" />

            <div className="px-4 sm:px-10 py-10 max-w-[1100px] mx-auto space-y-6">
                {/* Header */}
                <div className="border-b border-[#E0E0E0] pb-4 flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-[#212121]" />
                    <div>
                        <h1 className="text-xl font-extrabold tracking-widest text-[#212121] uppercase">Pesanan Saya</h1>
                        <p className="text-[#747878] text-xs mt-0.5">Riwayat dan status seluruh pesanan Anda.</p>
                    </div>
                </div>

                {/* Order List */}
                {orders.data.length === 0 ? (
                    <div className="bg-white border border-[#E0E0E0] py-20 text-center space-y-4">
                        <Package className="w-12 h-12 text-[#E0E0E0] mx-auto" />
                        <p className="text-[#747878] text-xs font-bold uppercase tracking-wider">Belum ada pesanan.</p>
                        <Link
                            href={route('storefront.home')}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#212121] text-white text-xs font-bold rounded-none uppercase tracking-wider"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map((order) => {
                            const firstItem = order.items?.[0];
                            const moreCount = (order.items?.length || 0) - 1;

                            return (
                                <Link
                                    key={order.id}
                                    href={route('storefront.order.detail', order.id)}
                                    className="block bg-white border border-[#E0E0E0] hover:border-[#212121] transition-colors group"
                                >
                                    {/* Order header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E0E0E0] bg-[#f9f9f9]">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-[10px] font-bold text-[#212121] uppercase tracking-widest">{order.order_number}</span>
                                            <span className="text-[9px] text-[#747878]">{formatDate(order.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(order.status, order.payment_status)}
                                            {getPaymentBadge(order.payment_status)}
                                            <ChevronRight className="w-4 h-4 text-[#747878] group-hover:text-[#212121] transition-colors" />
                                        </div>
                                    </div>

                                    {/* Order body */}
                                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {firstItem && (
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-[#212121] truncate uppercase tracking-wider">
                                                        {firstItem.product_name}
                                                    </p>
                                                    <p className="text-[10px] text-[#747878]">
                                                        {firstItem.variant_label} × {firstItem.quantity}
                                                        {moreCount > 0 && (
                                                            <span className="ml-1.5 text-[#212121] font-bold">+{moreCount} produk lainnya</span>
                                                        )}
                                                    </p>
                                                    {order.shipping && (
                                                        <p className="text-[10px] text-[#747878]">
                                                            Kurir: <strong className="text-[#212121]">{order.shipping.courier?.toUpperCase()} {order.shipping.service}</strong>
                                                            {order.shipping.tracking_number && (
                                                                <span className="ml-2 text-[#530A0C] font-bold">Resi: {order.shipping.tracking_number}</span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[9px] text-[#747878] uppercase tracking-wider">Total</p>
                                            <p className="text-base font-extrabold text-[#212121]">{formatCurrency(order.total_amount)}</p>
                                            {order.payment_method && (
                                                <p className="text-[9px] text-[#747878] mt-0.5">{order.payment_method}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {orders.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-4 py-2 text-xs font-bold border transition-all ${
                                        link.active
                                            ? 'bg-[#212121] text-white border-[#212121]'
                                            : 'bg-white text-[#747878] border-[#E0E0E0] hover:border-[#212121] hover:text-[#212121]'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-xs font-bold border border-[#E0E0E0] text-[#E0E0E0] cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
