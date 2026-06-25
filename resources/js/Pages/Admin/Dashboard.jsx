import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    DollarSign,
    ShoppingBag,
    Layers,
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    RefreshCw,
    TrendingUp,
    Package,
    ReceiptText,
} from 'lucide-react';

export default function Dashboard({ stats, chartData, recentOrders, lowStockVariants, statusCounts, minStockThreshold }) {

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);

    const statCards = [
        {
            title: 'Total Pendapatan',
            value: formatCurrency(stats.total_sales),
            desc: 'Dari pesanan terbayar',
            icon: DollarSign,
            accent: '#10b981',
            bg: '#f0fdf4',
            border: '#bbf7d0',
            iconBg: '#dcfce7',
        },
        {
            title: 'Total Pesanan',
            value: stats.total_orders,
            desc: 'Seluruh status pesanan',
            icon: ShoppingBag,
            accent: '#6366f1',
            bg: '#f5f3ff',
            border: '#ddd6fe',
            iconBg: '#ede9fe',
        },
        {
            title: 'Jumlah Produk',
            value: stats.total_products,
            desc: 'Terdaftar di katalog',
            icon: Layers,
            accent: '#0ea5e9',
            bg: '#f0f9ff',
            border: '#bae6fd',
            iconBg: '#e0f2fe',
        },
        {
            title: 'Stok Kritis',
            value: stats.critical_stock,
            desc: `Varian stok ≤ ${minStockThreshold}`,
            icon: AlertTriangle,
            accent: stats.critical_stock > 0 ? '#f59e0b' : '#10b981',
            bg: stats.critical_stock > 0 ? '#fffbeb' : '#f0fdf4',
            border: stats.critical_stock > 0 ? '#fde68a' : '#bbf7d0',
            iconBg: stats.critical_stock > 0 ? '#fef3c7' : '#dcfce7',
        },
    ];

    const getStatusBadge = (status) => {
        const map = {
            pending_payment: ['badge-amber', 'Pending'],
            paid:            ['badge-blue',  'Lunas'],
            processing:      ['badge-indigo','Diproses'],
            shipped:         ['badge-cyan',  'Dikirim'],
            delivered:       ['badge-green', 'Selesai'],
            cancelled:       ['badge-red',   'Batal'],
            returned:        ['badge-purple','Retur'],
        };
        const [cls, label] = map[status] || ['badge-gray', status];
        return <span className={`badge ${cls}`}>{label}</span>;
    };

    /* ── Custom Tooltip ── */
    const ChartTooltip = ({ active, payload, label, formatter }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-sm">
                <p className="font-semibold text-gray-700 mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }} className="font-medium">
                        {formatter ? formatter(p.value) : p.value}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Dashboard — iLook Admin" />

            <div className="flex flex-col gap-6">

                {/* ═══ HERO BANNER ═══ */}
                <div className="admin-hero text-white px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative z-10">
                        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">
                            iLook Fashion · Panel Admin
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                            Selamat Datang di Dashboard
                        </h1>
                        <p className="text-blue-100/80 text-sm mt-2 max-w-md leading-relaxed">
                            Pantau performa penjualan, stok produk, dan pesanan masuk — semuanya dalam satu tampilan terpadu.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            <Link
                                href={route('admin.orders')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-semibold text-sm rounded-xl shadow hover:bg-gray-50 transition-all"
                            >
                                <ReceiptText className="w-4 h-4" />
                                Lihat Pesanan
                            </Link>
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Mini Stats inside hero */}
                    <div className="relative z-10 flex gap-4 flex-wrap md:flex-nowrap">
                        {[
                            { label: 'Pesanan Hari Ini', value: chartData?.[6]?.orders ?? 0, icon: Package },
                            { label: 'Pendapatan Hari Ini', value: formatCurrency(chartData?.[6]?.revenue ?? 0), icon: TrendingUp },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4 min-w-[150px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className="w-4 h-4 text-blue-300" />
                                        <span className="text-[11px] text-blue-200/80 font-medium uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">{item.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ═══ STAT CARDS ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                className="admin-card p-5 flex items-center justify-between"
                                style={{ borderColor: card.border }}
                            >
                                <div className="space-y-1.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                        {card.title}
                                    </p>
                                    <h3
                                        className="text-2xl font-bold tracking-tight"
                                        style={{ color: '#111827', fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {card.value}
                                    </h3>
                                    <p className="text-xs text-gray-400">{card.desc}</p>
                                </div>
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: card.iconBg }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: card.accent }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ═══ CHARTS ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Area Chart — Revenue */}
                    <div className="admin-card p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-[15px] font-bold text-gray-800">
                                    Performa Penjualan
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Pendapatan 7 hari terakhir</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Minggu Ini
                            </span>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%"   stopColor="#10b981" stopOpacity={0.18} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#d1d5db"
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#d1d5db"
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={2.5}
                                        fill="url(#revGrad)"
                                        dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                                        activeDot={{ r: 5, fill: '#10b981' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart — Orders */}
                    <div className="admin-card p-6">
                        <div className="mb-5">
                            <h3 className="text-[15px] font-bold text-gray-800">Volume Transaksi</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Jumlah pesanan harian</p>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#d1d5db"
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#d1d5db"
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<ChartTooltip formatter={(v) => `${v} pesanan`} />} />
                                    <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Status summary pills */}
                        {statusCounts && Object.keys(statusCounts).length > 0 && (
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    Ringkasan Status
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(statusCounts).slice(0, 4).map(([status, count]) => (
                                        <span key={status} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            {status} ({count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ BOTTOM GRID: Recent Orders + Low Stock ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Recent Orders Table */}
                    <div className="admin-card p-6 lg:col-span-2 overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-[15px] font-bold text-gray-800">Pesanan Terbaru</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Transaksi masuk teranyar</p>
                            </div>
                            <Link
                                href={route('admin.orders')}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Lihat Semua
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full admin-table">
                                <thead>
                                    <tr>
                                        <th className="text-left">Invoice</th>
                                        <th className="text-left">Pembeli</th>
                                        <th className="text-left">Item</th>
                                        <th className="text-left">Total</th>
                                        <th className="text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">
                                                Belum ada pesanan masuk.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>
                                                    <Link
                                                        href={`${route('admin.orders')}?search=${order.order_number}`}
                                                        className="font-mono text-[13px] font-semibold text-emerald-600 hover:text-emerald-700"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="font-medium text-gray-800">{order.buyer_name}</td>
                                                <td className="text-gray-500">{order.items_count} pcs</td>
                                                <td className="font-semibold text-gray-800">{formatCurrency(order.total_amount)}</td>
                                                <td>{getStatusBadge(order.status)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="admin-card p-6 flex flex-col gap-4">
                        <div>
                            <h3 className="text-[15px] font-bold text-gray-800">Alert Stok Kritis</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Varian produk hampir habis</p>
                        </div>

                        <div className="flex-1">
                            {lowStockVariants.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-8 gap-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Semua Aman</p>
                                        <p className="text-xs text-gray-400 mt-1">Tidak ada varian dengan stok kritis.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lowStockVariants.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{item.sku}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    Varian: <span className="font-semibold text-gray-700">{item.variant_name}</span>
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                        item.stock === 0
                                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                                                    }`}
                                                >
                                                    {item.stock} Pcs
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href={route('admin.stocks')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-all"
                        >
                            Kelola Inventori Stok
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}


