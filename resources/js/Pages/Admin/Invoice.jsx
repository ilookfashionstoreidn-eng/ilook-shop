import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Sparkles, Printer } from 'lucide-react';

export default function Invoice({ order }) {
    
    // Auto trigger print dialog on page load
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 1000);
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 p-8 font-sans print:p-0">
            <Head title={`Invoice ${order.order_number}`} />

            <div className="max-w-3xl mx-auto border border-slate-200 p-8 rounded-xl print:border-0 print:p-0 space-y-8">
                {/* Print action header (hidden on print) */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-lg print:hidden">
                    <span className="text-xs text-slate-500 font-medium">Dokumen ini diformat untuk langsung dicetak.</span>
                    <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Manual</span>
                    </button>
                </div>

                {/* Top Branding Header */}
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-500 text-slate-950 p-1 rounded">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-lg tracking-wide text-slate-950">iLook Fashion</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Pusat Pakaian & Mode Premium Terlengkap<br />
                            Jakarta Barat, DKI Jakarta, Indonesia<br />
                            WhatsApp: 0812-3456-7890
                        </p>
                    </div>

                    <div className="text-right space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase">Invoice</h1>
                        <p className="text-xs font-semibold font-mono text-emerald-600">{order.order_number}</p>
                        <div className="text-xs text-slate-500">
                            <div>Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit', month: 'long', year: 'numeric'
                            })}</div>
                            <div>Metode Pembayaran: <span className="font-semibold text-slate-800">{order.payment_method}</span></div>
                        </div>
                    </div>
                </div>

                {/* Sender & Receiver Address grid */}
                <div className="grid grid-cols-2 gap-6 border-y border-slate-100 py-6 text-xs">
                    <div>
                        <span className="font-bold uppercase text-slate-400 tracking-wider block mb-1">Dikirim Oleh:</span>
                        <p className="font-semibold text-slate-800">iLook Fashion Warehouse</p>
                        <p className="text-slate-500">
                            Kec. Kembangan, Kota Jakarta Barat<br />
                            DKI Jakarta - 11610<br />
                            Telp: 0812-3456-7890
                        </p>
                    </div>

                    <div>
                        <span className="font-bold uppercase text-slate-400 tracking-wider block mb-1">Tujuan Pengiriman:</span>
                        <p className="font-semibold text-slate-800">{order.shipping?.recipient_name}</p>
                        <p className="text-slate-500">
                            {order.shipping?.address}<br />
                            {order.shipping?.city}, {order.shipping?.province}<br />
                            Kode Pos: {order.shipping?.postal_code}<br />
                            Telp: {order.shipping?.phone}
                        </p>
                    </div>
                </div>

                {/* Items list table */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-950 text-sm">Daftar Barang Belanja</h3>
                    <table className="min-w-full text-xs text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase">
                                <th className="pb-2">Nama Barang & Varian</th>
                                <th className="pb-2">SKU</th>
                                <th className="pb-2 text-center">Qty</th>
                                <th className="pb-2 text-right">Harga Satuan</th>
                                <th className="pb-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {order.items?.map((item) => (
                                <tr key={item.id} className="py-2.5">
                                    <td className="py-3 font-semibold text-slate-900">
                                        {item.product_name}
                                        <div className="text-[10px] text-emerald-600 font-medium font-sans">Varian: {item.variant_label}</div>
                                    </td>
                                    <td className="py-3 font-mono text-slate-500">{item.variant?.sku || '-'}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">{formatCurrency(item.unit_price)}</td>
                                    <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Calculations */}
                <div className="border-t border-slate-150 pt-4 flex justify-end">
                    <div className="w-72 space-y-1.5 text-xs text-right text-slate-600">
                        <div className="flex justify-between"><span className="text-slate-500">Total Harga Barang:</span> <span className="font-medium text-slate-800">{formatCurrency(order.subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Ongkos Kirim Raja Ongkir:</span> <span className="font-medium text-slate-800">{formatCurrency(order.shipping_cost)}</span></div>
                        <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-950 font-bold text-sm">Grand Total:</span> <span className="text-sm font-bold text-emerald-600">{formatCurrency(order.total_amount)}</span></div>
                    </div>
                </div>

                {/* Footer terms */}
                <div className="border-t border-slate-100 pt-6 text-center text-[10px] text-slate-400 space-y-1.5">
                    <p className="font-semibold uppercase text-slate-500">Terima Kasih Telah Berbelanja di iLook Fashion</p>
                    <p>Pesanan Anda diproses secara aman. Silakan simpan invoice digital ini sebagai bukti garansi produk.</p>
                </div>
            </div>
        </div>
    );
}
