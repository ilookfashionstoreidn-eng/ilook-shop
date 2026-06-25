import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Save,
    Settings as SettingsIcon,
    Smartphone,
    MapPin,
    AlertTriangle,
    RefreshCw,
    Truck,
} from 'lucide-react';

export default function Settings({ settings, cities }) {

    // Form setup with initial database settings values
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        shop_name: settings.shop_name || 'iLook Fashion',
        whatsapp_number: settings.whatsapp_number || '081234567890',
        origin_city_id: settings.origin_city_id || 152,
        min_stock_alert: settings.min_stock_alert || 5,
        ginee_sync_enabled: settings.ginee_sync_enabled === '1' || settings.ginee_sync_enabled === true,
        couriers_active: settings.couriers_active || ['jne', 'jnt', 'sicepat'],
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    const handleCourierToggle = (courierId) => {
        const current = [...data.couriers_active];
        const index = current.indexOf(courierId);

        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(courierId);
        }

        setData('couriers_active', current);
    };

    const couriersList = [
        { id: 'jne', name: 'JNE Express' },
        { id: 'jnt', name: 'J&T Express' },
        { id: 'sicepat', name: 'SiCepat' },
        { id: 'anteraja', name: 'Anteraja' },
        { id: 'pos', name: 'POS Indonesia' },
        { id: 'tiki', name: 'TIKI' },
    ];

    return (
        <AdminLayout>
            <Head title="Pengaturan Toko iLook" />

            <div className="flex flex-col gap-6 max-w-4xl">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pengaturan Toko</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Konfigurasi data dasar iLook Fashion, integrasi kurir pengiriman Raja Ongkir, dan sync omnichannel Ginee.</p>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    {/* General Settings */}
                    <div className="admin-card p-6 space-y-4">
                        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-bold text-gray-800 font-outfit">Informasi Toko Umum</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Nama Toko Online</label>
                                <input
                                    type="text"
                                    required
                                    value={data.shop_name}
                                    onChange={(e) => setData('shop_name', e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                />
                                {errors.shop_name && <p className="text-xs text-red-500 mt-1">{errors.shop_name}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp CS / Admin
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.whatsapp_number}
                                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                />
                                {errors.whatsapp_number && <p className="text-xs text-red-500 mt-1">{errors.whatsapp_number}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Raja Ongkir Logistics */}
                    <div className="admin-card p-6 space-y-4">
                        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <div>
                                <h3 className="text-base font-bold text-gray-800 font-outfit font-semibold">Gudang Pengiriman & Logistik</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Asal pengiriman paket untuk integrasi Raja Ongkir</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Kota Asal Gudang</label>
                            <select
                                value={data.origin_city_id}
                                onChange={(e) => setData('origin_city_id', parseInt(e.target.value))}
                                className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700"
                            >
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                            {errors.origin_city_id && <p className="text-xs text-red-500 mt-1">{errors.origin_city_id}</p>}
                        </div>
                    </div>

                    {/* Couriers Config */}
                    <div className="admin-card p-6 space-y-4">
                        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-emerald-600" />
                            <div>
                                <h3 className="text-base font-bold text-gray-800 font-outfit">Metode Pengiriman Aktif</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Kurir yang akan ditampilkan kepada pembeli di halaman checkout</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {couriersList.map((courier) => {
                                const isChecked = data.couriers_active.includes(courier.id);
                                return (
                                    <button
                                        key={courier.id}
                                        type="button"
                                        onClick={() => handleCourierToggle(courier.id)}
                                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                                            isChecked
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-500 hover:text-gray-750 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-xs font-semibold">{courier.name}</span>
                                        <div
                                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                                isChecked
                                                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                                                    : 'border-gray-300 bg-white'
                                            }`}
                                        >
                                            {isChecked ? '✓' : ''}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.couriers_active && <p className="text-xs text-red-500 mt-1">{errors.couriers_active}</p>}
                    </div>

                    {/* Stock Alert & Ginee Sync Settings */}
                    <div className="admin-card p-6 space-y-4">
                        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-bold text-gray-800 font-outfit">Alert Stok & Omnichannel</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Ambang Batas Alert Stok Kritis</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={data.min_stock_alert}
                                    onChange={(e) => setData('min_stock_alert', parseInt(e.target.value) || 0)}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                />
                                {errors.min_stock_alert && <p className="text-xs text-red-500 mt-1">{errors.min_stock_alert}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase block">Koneksi Otomatis Ginee</label>
                                <button
                                    type="button"
                                    onClick={() => setData('ginee_sync_enabled', !data.ginee_sync_enabled)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                        data.ginee_sync_enabled
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-xs font-semibold flex items-center gap-1.5">
                                        <RefreshCw className={`w-4 h-4 ${data.ginee_sync_enabled ? 'animate-spin' : ''}`} />
                                        <span>Sinkronisasi Ginee Dua Arah</span>
                                    </span>
                                    <div
                                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                                            data.ginee_sync_enabled ? 'bg-indigo-650' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 transform ${
                                                data.ginee_sync_enabled ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Row */}
                    <div className="flex items-center justify-between">
                        {recentlySuccessful && (
                            <span className="text-xs text-emerald-600 font-semibold animate-pulse-soft">
                                Pengaturan berhasil disimpan ke database!
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-3 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all ml-auto shadow-md disabled:opacity-50 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            <span>Simpan Pengaturan</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
