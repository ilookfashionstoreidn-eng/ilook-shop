import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Save,
    Percent,
    Coins,
    HelpCircle,
    Info,
    Receipt,
    Calculator,
    CheckCircle2
} from 'lucide-react';

export default function TaxSettings({ settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        tax_type: settings.tax_type || 'percentage',
        tax_value: settings.tax_value || 0,
        admin_fee_type: settings.admin_fee_type || 'nominal',
        admin_fee_value: settings.admin_fee_value || 0,
    });

    const [mockSubtotal, setMockSubtotal] = useState(100000);
    const [mockShipping, setMockShipping] = useState(15000);
    const [mockDiscount, setMockDiscount] = useState(10000);

    const [calculatedTax, setCalculatedTax] = useState(0);
    const [calculatedAdminFee, setCalculatedAdminFee] = useState(0);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    // Calculate live preview calculations when values change
    useEffect(() => {
        const taxableBase = Math.max(0, mockSubtotal - mockDiscount);
        
        let tax = 0;
        if (data.tax_type === 'percentage') {
            tax = Math.round(taxableBase * (Number(data.tax_value) / 100));
        } else {
            tax = Number(data.tax_value);
        }
        
        let fee = 0;
        if (data.admin_fee_type === 'percentage') {
            fee = Math.round(taxableBase * (Number(data.admin_fee_value) / 100));
        } else {
            fee = Number(data.admin_fee_value);
        }

        tax = Math.max(0, tax);
        fee = Math.max(0, fee);

        setCalculatedTax(tax);
        setCalculatedAdminFee(fee);
        setCalculatedTotal(mockSubtotal - mockDiscount + mockShipping + tax + fee);
    }, [data.tax_type, data.tax_value, data.admin_fee_type, data.admin_fee_value, mockSubtotal, mockShipping, mockDiscount]);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        post(route('admin.tax-settings.update'));
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Pajak & Biaya Admin - iLook" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl">
                {/* Left Form Column */}
                <div className="lg:col-span-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-outfit">PPN & Biaya Admin</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Konfigurasi pengaturan perpajakan (PPN) dan biaya transaksi/admin secara global untuk seluruh transaksi di iLook.</p>
                    </div>

                    {recentlySuccessful && (
                        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold animate-pulse-soft">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <span>Pengaturan PPN dan Biaya Admin berhasil diperbarui ke database!</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        {/* PPN Card */}
                        <div className="admin-card p-6 space-y-5">
                            <div className="border-b border-gray-100 pb-3 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-650 flex items-center justify-center">
                                    <Receipt className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 font-outfit">Pengaturan PPN (Pajak)</h3>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Konfigurasi pajak pertambahan nilai yang dikenakan ke pembeli</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Tipe PPN</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('tax_type', 'percentage')}
                                            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                                                data.tax_type === 'percentage'
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            Persentase (%)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('tax_type', 'nominal')}
                                            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                                                data.tax_type === 'nominal'
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            Nominal (Flat Rp)
                                        </button>
                                    </div>
                                    {errors.tax_type && <p className="text-xs text-red-500 mt-1">{errors.tax_type}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">
                                        Nilai Pajak ({data.tax_type === 'percentage' ? '%' : 'Rp'})
                                    </label>
                                    <div className="relative">
                                        {data.tax_type === 'nominal' && (
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xs font-semibold">Rp</span>
                                            </div>
                                        )}
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step={data.tax_type === 'percentage' ? "0.1" : "1"}
                                            value={data.tax_value}
                                            onChange={(e) => setData('tax_value', parseFloat(e.target.value) || 0)}
                                            className={`w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl py-2.5 text-gray-800 ${
                                                data.tax_type === 'nominal' ? 'pl-9 pr-4' : 'px-4'
                                            }`}
                                        />
                                        {data.tax_type === 'percentage' && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xs font-bold">%</span>
                                            </div>
                                        )}
                                    </div>
                                    {errors.tax_value && <p className="text-xs text-red-500 mt-1">{errors.tax_value}</p>}
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-400 flex items-start gap-1">
                                <Info className="w-3.5 h-3.5 text-gray-450 flex-shrink-0 mt-0.5" />
                                <span>
                                    PPN akan dihitung otomatis saat pembeli melakukan checkout pesanan. 
                                    {data.tax_type === 'percentage' 
                                        ? ' Jika diatur persentase, pajak dihitung dari subtotal produk setelah dikurangi kupon diskon.' 
                                        : ' Pajak flat rupiah akan langsung ditambahkan secara flat per checkout transaksi.'
                                    }
                                </span>
                            </p>
                        </div>

                        {/* Admin Fee Card */}
                        <div className="admin-card p-6 space-y-5">
                            <div className="border-b border-gray-100 pb-3 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-650 flex items-center justify-center">
                                    <Coins className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 font-outfit">Biaya Layanan / Admin</h3>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Konfigurasi biaya administrasi tambahan yang dikenakan per checkout</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Tipe Biaya Admin</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('admin_fee_type', 'percentage')}
                                            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                                                data.admin_fee_type === 'percentage'
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            Persentase (%)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('admin_fee_type', 'nominal')}
                                            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                                                data.admin_fee_type === 'nominal'
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            Nominal (Flat Rp)
                                        </button>
                                    </div>
                                    {errors.admin_fee_type && <p className="text-xs text-red-500 mt-1">{errors.admin_fee_type}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">
                                        Nilai Biaya Admin ({data.admin_fee_type === 'percentage' ? '%' : 'Rp'})
                                    </label>
                                    <div className="relative">
                                        {data.admin_fee_type === 'nominal' && (
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xs font-semibold">Rp</span>
                                            </div>
                                        )}
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step={data.admin_fee_type === 'percentage' ? "0.1" : "1"}
                                            value={data.admin_fee_value}
                                            onChange={(e) => setData('admin_fee_value', parseFloat(e.target.value) || 0)}
                                            className={`w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl py-2.5 text-gray-800 ${
                                                data.admin_fee_type === 'nominal' ? 'pl-9 pr-4' : 'px-4'
                                            }`}
                                        />
                                        {data.admin_fee_type === 'percentage' && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xs font-bold">%</span>
                                            </div>
                                        )}
                                    </div>
                                    {errors.admin_fee_value && <p className="text-xs text-red-500 mt-1">{errors.admin_fee_value}</p>}
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-400 flex items-start gap-1">
                                <Info className="w-3.5 h-3.5 text-gray-450 flex-shrink-0 mt-0.5" />
                                <span>
                                    Biaya admin adalah tambahan overhead operasional transaksi.
                                    {data.admin_fee_type === 'percentage' 
                                        ? ' Jika diatur persentase, biaya dihitung dari subtotal produk setelah dikurangi kupon diskon.' 
                                        : ' Biaya flat nominal akan langsung diaplikasikan ke total pesanan.'
                                    }
                                </span>
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all ml-auto shadow-md disabled:opacity-50 text-sm font-outfit"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'Menyimpan...' : 'Simpan Pengaturan PPN & Biaya'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Interactive Live Preview Column */}
                <div className="lg:col-span-4">
                    <div className="sticky top-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-outfit">
                                <Calculator className="w-4 h-4 text-emerald-600" />
                                <span>Live Preview Checkout</span>
                            </h3>
                            <p className="text-xs text-gray-400 leading-normal">Uji simulasi kalkulasi total pembayaran langsung di bawah ini berdasarkan nilai yang Anda inputkan.</p>
                        </div>

                        {/* Simulator Card Controls */}
                        <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold text-gray-700 uppercase font-sans tracking-wide">Data Simulasi</h4>
                            
                            <div className="space-y-2 text-xs">
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                        <span>Subtotal Produk</span>
                                        <span>{formatCurrency(mockSubtotal)}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10000" 
                                        max="1000000" 
                                        step="10000" 
                                        value={mockSubtotal} 
                                        onChange={e => setMockSubtotal(Number(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                        <span>Ongkir</span>
                                        <span>{formatCurrency(mockShipping)}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="150000" 
                                        step="5000" 
                                        value={mockShipping} 
                                        onChange={e => setMockShipping(Number(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                        <span>Potongan Kupon</span>
                                        <span>{formatCurrency(mockDiscount)}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100000" 
                                        step="5000" 
                                        value={mockDiscount} 
                                        onChange={e => setMockDiscount(Number(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Checkout Invoice Simulation UI */}
                        <div className="border border-gray-200 bg-white p-5 rounded-2xl shadow-sm text-xs font-sans text-gray-500 space-y-3.5 relative overflow-hidden">
                            {/* Decorative top strip */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
                            
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 uppercase tracking-wider flex items-center justify-between">
                                <span>Detail Tagihan</span>
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-medium">SIMULATION</span>
                            </h3>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(mockSubtotal)}</span>
                                </div>
                                {mockDiscount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-semibold">
                                        <span>Potongan Kupon</span>
                                        <span>-{formatCurrency(mockDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(mockShipping)}</span>
                                </div>

                                {/* PPN Preview */}
                                <div className="flex justify-between items-center text-gray-650">
                                    <span className="flex items-center gap-1">
                                        <span>PPN</span>
                                        <span className="text-[9px] text-gray-400 font-semibold bg-gray-100 px-1 rounded-sm">
                                            {data.tax_type === 'percentage' ? `${data.tax_value}%` : 'Flat'}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(calculatedTax)}</span>
                                </div>

                                {/* Admin Fee Preview */}
                                <div className="flex justify-between items-center text-gray-650">
                                    <span className="flex items-center gap-1">
                                        <span>Biaya Admin</span>
                                        <span className="text-[9px] text-gray-400 font-semibold bg-gray-100 px-1 rounded-sm">
                                            {data.admin_fee_type === 'percentage' ? `${data.admin_fee_value}%` : 'Flat'}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(calculatedAdminFee)}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                                <span className="text-gray-900 font-bold">Total Tagihan</span>
                                <span className="text-sm font-extrabold text-emerald-600 font-outfit">{formatCurrency(calculatedTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
