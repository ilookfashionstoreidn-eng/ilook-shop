import React from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle, 
    Sparkles, 
    Truck, 
    ShoppingBag, 
    ArrowRight, 
    MapPin, 
    Info 
} from 'lucide-react';

export default function OrderSuccess({ order }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    return (
        <StorefrontLayout>
            <Head title="Pembayaran Sukses - iLook Fashion" />

            <div className="px-10 py-10 max-w-[1280px] mx-auto">
            <div className="max-w-2xl mx-auto space-y-6 text-xs text-[#747878]">
                {/* Header Success */}
                <div className="text-center py-6 space-y-3">
                    <div className="inline-flex items-center justify-center p-3 rounded-none bg-white text-[#212121] border border-[#212121]">
                        <CheckCircle className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-extrabold text-[#212121] uppercase tracking-wider">Pembayaran Berhasil!</h1>
                        <p className="text-[#747878] text-xs font-bold uppercase tracking-wider">Pesanan Anda telah diterima dan langsung kami proses.</p>
                    </div>
                </div>

                {/* Ginee Omnichannel Integration Status Report */}
                <div className="bg-white p-5 rounded-none border border-[#E0E0E0] space-y-3">
                    <h3 className="text-sm font-extrabold text-[#212121] flex items-center gap-2 uppercase tracking-widest">
                        <Sparkles className="w-4.5 h-4.5 text-[#212121]" />
                        <span>Omnichannel Ginee Sync Report</span>
                    </h3>
                    
                    {order.ginee_order_id ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#212121] font-bold bg-[#f9f9f9] border border-[#E0E0E0] p-2.5 rounded-none text-[10px] uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-[#212121]"></span>
                                <span>Tersinkronisasi Riil ke Ginee OMS</span>
                            </div>
                            <p className="text-[#747878] text-[10px] leading-relaxed">
                                Pesanan ini telah berhasil dipush secara real-time ke akun Ginee Anda dengan **Ginee Order ID: <span className="font-mono text-[#212121] font-extrabold">{order.ginee_order_id}</span>**. Pengurangan stok inventaris global di Shopee/Tokopedia akan dilakukan secara otomatis oleh Ginee.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#530A0C] font-bold bg-[#530A0C]/5 border border-[#530A0C]/20 p-2.5 rounded-none text-[10px] uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-[#530A0C]"></span>
                                <span>Terbuat Lokal (Ginee Sync Di-skip/Mock)</span>
                            </div>
                            <p className="text-[#747878] text-[10px] leading-relaxed">
                                Pesanan tercatat sukses di database lokal iLook Shop. Sinkronisasi otomatis ke Ginee dilewati karena Ginee API Key Anda berjalan pada mode sandbox tanpa toko/gudang riil yang dikaitkan.
                            </p>
                        </div>
                    )}
                </div>

                {/* Receipt Details Card */}
                <div className="bg-white p-6 rounded-none border border-[#E0E0E0] space-y-4">
                    <h3 className="text-sm font-extrabold text-[#212121] border-b border-[#E0E0E0] pb-2 flex items-center gap-1.5 uppercase tracking-widest">
                        <span>Rincian Pembelian</span>
                    </h3>

                    {/* Meta information row */}
                    <div className="grid grid-cols-2 gap-4 border-b border-[#E0E0E0] pb-3 text-xs">
                        <div className="space-y-0.5">
                            <span className="text-[10px] text-[#747878] uppercase font-bold tracking-wider">Nomor Pesanan</span>
                            <span className="font-mono text-[#212121] font-extrabold block">{order.order_number}</span>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] text-[#747878] uppercase font-bold tracking-wider">Metode Pembayaran</span>
                            <span className="text-[#212121] font-bold block">{order.payment_method}</span>
                        </div>
                    </div>

                    {/* Delivery metadata */}
                    {order.shipping && (
                        <div className="space-y-2 border-b border-[#E0E0E0] pb-3 text-xs">
                            <h4 className="text-[10px] text-[#747878] uppercase font-extrabold flex items-center gap-1 tracking-wider">
                                <MapPin className="w-3.5 h-3.5" /> Informasi Pengiriman
                            </h4>
                            <div className="space-y-1 pl-4">
                                <p className="text-[#212121] font-bold">{order.shipping.recipient_name} ({order.shipping.phone})</p>
                                <p className="text-[#747878] text-[11px] leading-relaxed">{order.shipping.address}</p>
                                <p className="text-[#212121] text-[11px] font-bold mt-1">
                                    Kurir: <span className="uppercase text-[#530A0C] font-extrabold">{order.shipping.courier} {order.shipping.service}</span> (Ongkir: {formatCurrency(order.shipping.shipping_cost)})
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Items row */}
                    <div className="space-y-2.5 text-xs">
                        <h4 className="text-[10px] text-[#747878] uppercase font-extrabold flex items-center gap-1 tracking-wider">
                            <ShoppingBag className="w-3.5 h-3.5" /> Item yang Dibeli
                        </h4>
                        <div className="divide-y divide-[#E0E0E0] pl-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="py-2 flex justify-between items-center text-[11px]">
                                    <div>
                                        <span className="font-bold text-[#212121] block uppercase tracking-wider">{item.product_name}</span>
                                        <span className="text-[#747878] block">Varian: {item.variant_name} x {item.quantity}</span>
                                    </div>
                                    <span className="font-extrabold text-[#212121]">{formatCurrency(item.total_price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals row summary */}
                    <div className="border-t border-[#E0E0E0] pt-3 space-y-2 text-right text-xs">
                        <div className="flex justify-between items-center max-w-xs ml-auto">
                            <span>Subtotal</span>
                            <span className="font-bold text-[#212121]">{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center max-w-xs ml-auto">
                            <span>Ongkir</span>
                            <span className="font-bold text-[#212121]">{formatCurrency(order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between items-baseline max-w-xs ml-auto border-t border-[#E0E0E0] pt-2">
                            <span className="font-bold text-[#212121]">Total Dibayar</span>
                            <span className="text-sm font-extrabold text-[#530A0C]">{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons navigation */}
                <div className="flex gap-4">
                    <Link 
                        href={route('storefront.home')}
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-none text-xs font-bold bg-black hover:bg-black/90 text-white transition-all uppercase tracking-widest"
                    >
                        <span>Belanja Lagi</span>
                    </Link>
                    <a
                        href={`https://wa.me/6281234567890`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-none text-xs font-bold border border-black hover:bg-black hover:text-white text-black transition-all uppercase tracking-widest"
                    >
                        <span>Hubungi CS Toko</span>
                    </a>
                </div>
            </div>
            </div>
        </StorefrontLayout>
    );
}
