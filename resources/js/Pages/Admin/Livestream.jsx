import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    Video,
    X,
    CheckCircle,
    XCircle,
    ExternalLink,
    Play,
    Info,
    Tv
} from 'lucide-react';

export default function Livestream({ livestreams }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentLivestreamId, setCurrentLivestreamId] = useState(null);

    const { data, setData, post, put, delete: destroy, errors, reset, processing } = useForm({
        title: '',
        tiktok_url: '',
        is_active: false,
    });

    const activeStream = livestreams.find(stream => stream.is_active);

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setCurrentLivestreamId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (stream) => {
        setEditMode(true);
        setCurrentLivestreamId(stream.id);
        setData({
            title: stream.title,
            tiktok_url: stream.tiktok_url,
            is_active: stream.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSaveStream = (e) => {
        e.preventDefault();

        if (editMode) {
            put(route('admin.livestream.update', currentLivestreamId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.livestream.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteStream = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus link livestreaming ini?')) {
            destroy(route('admin.livestream.destroy', id));
        }
    };

    const handleToggleStatus = (stream) => {
        router.put(route('admin.livestream.update', stream.id), {
            title: stream.title,
            tiktok_url: stream.tiktok_url,
            is_active: !stream.is_active,
        }, {
            preserveScroll: true,
        });
    };

    // Helper to identify if it is a livestream vs regular video
    const isLiveUrl = (url) => {
        return url.toLowerCase().includes('/live');
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Livestream TikTok - iLook Fashion" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 font-outfit">
                            <Video className="w-6 h-6 text-emerald-600" />
                            Manajemen Livestream TikTok
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">Kelola tautan Livestreaming atau video dari TikTok untuk disajikan di halaman awal toko.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Tambah Livestream</span>
                    </button>
                </div>

                {/* Info Card & Active Preview Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Instructions & Help */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4 text-blue-800">
                            <Info className="w-6 h-6 flex-shrink-0 text-blue-500 mt-0.5" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm">Panduan Tautan TikTok</h3>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Untuk menampilkan video atau livestreaming di halaman utama storefront, pastikan Anda menggunakan tautan dengan format berikut:
                                </p>
                                <ul className="list-disc list-inside text-xs text-blue-700 space-y-1 pl-1">
                                    <li><strong>TikTok Live:</strong> <code>https://www.tiktok.com/@username/live</code></li>
                                    <li><strong>TikTok Video:</strong> <code>https://www.tiktok.com/@username/video/1234567890...</code></li>
                                </ul>
                                <p className="text-[11px] text-blue-600 italic">
                                    Sistem akan otomatis memparsing link yang Anda masukkan menjadi format embed responsif.
                                </p>
                            </div>
                        </div>

                        {/* Livestreams List Card */}
                        <div className="admin-card p-6 flex flex-col gap-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <h2 className="font-bold text-gray-800 text-[15px]">Riwayat Livestream</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                                    <thead>
                                        <tr className="text-gray-400 font-bold uppercase tracking-wider text-xs">
                                            <th className="pb-3 px-4">Judul / Label</th>
                                            <th className="pb-3 px-4">Tautan TikTok</th>
                                            <th className="pb-3 px-4 text-center">Tipe</th>
                                            <th className="pb-3 px-4 text-center">Status</th>
                                            <th className="pb-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-gray-700">
                                        {livestreams.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-10 text-gray-400 font-medium">
                                                    Belum ada livestream terdaftar. Klik "Tambah Livestream" untuk membuat.
                                                </td>
                                            </tr>
                                        ) : (
                                            livestreams.map((stream) => (
                                                <tr key={stream.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4 font-semibold text-gray-800">
                                                        {stream.title}
                                                    </td>
                                                    <td className="py-4 px-4 max-w-[200px] truncate text-gray-500">
                                                        <a href={stream.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 inline-flex items-center gap-1.5 font-mono text-xs">
                                                            {stream.tiktok_url}
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                        </a>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        {isLiveUrl(stream.tiktok_url) ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                                Live Stream
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                                <Play className="w-3 h-3 text-indigo-500" />
                                                                Video Post
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <button
                                                            onClick={() => handleToggleStatus(stream)}
                                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                                                stream.is_active
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100/70'
                                                            }`}
                                                        >
                                                            {stream.is_active ? (
                                                                <>
                                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                                    <span>Aktif</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-3.5 h-3.5 text-gray-300" />
                                                                    <span>Tidak Aktif</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <button
                                                                onClick={() => openEditModal(stream)}
                                                                className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStream(stream.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-all"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Preview Mockup Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
                            <div className="w-full flex items-center justify-between">
                                <h2 className="font-bold text-gray-800 text-[15px] flex items-center gap-1.5">
                                    <Tv className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                                    Preview Aktif
                                </h2>
                                {activeStream && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold rounded uppercase tracking-wider">
                                        ON STOREFRONT
                                    </span>
                                )}
                            </div>

                            {activeStream ? (
                                (() => {
                                    const activeIsTikTokLive = activeStream.tiktok_url.toLowerCase().includes('tiktok.com') && activeStream.tiktok_url.toLowerCase().includes('/live');
                                    const activeIsYoutubeLive = activeStream.tiktok_url.toLowerCase().includes('youtube.com') || activeStream.tiktok_url.toLowerCase().includes('youtu.be');
                                    const activeIsTwitchLive = activeStream.tiktok_url.toLowerCase().includes('twitch.tv');
                                    const activeIsAnyLive = activeIsTikTokLive || (activeIsYoutubeLive && activeStream.tiktok_url.toLowerCase().includes('live')) || activeIsTwitchLive;

                                    const getHandle = (url) => {
                                        if (url.includes('tiktok.com')) {
                                            const matches = url.match(/tiktok\.com\/@([a-zA-Z0-9_\.]+)/i);
                                            return matches ? `@${matches[1]}` : '@ilookstore';
                                        }
                                        if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                            return 'YouTube Live';
                                        }
                                        if (url.includes('twitch.tv')) {
                                            const matches = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
                                            return matches ? `Twitch: ${matches[1]}` : 'Twitch Live';
                                        }
                                        return 'iLOOK Channel';
                                    };

                                    return (
                                        <div className="w-full flex flex-col items-center gap-4 mt-2">
                                            <p className="text-xs text-gray-500 font-semibold text-center truncate w-full">
                                                "{activeStream.title}"
                                            </p>
                                            
                                            {/* Smartphone Mockup */}
                                            <div className="relative mx-auto w-[240px] h-[426px] bg-[#111] rounded-[36px] border-[8px] border-gray-800 shadow-2xl overflow-hidden flex flex-col">
                                                {/* Phone Speaker & Camera Notch */}
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-b-xl z-20 flex items-center justify-center">
                                                    <div className="w-6 h-1 bg-gray-600 rounded-full" />
                                                </div>

                                                {/* Red pulsing live indicator */}
                                                {activeIsAnyLive && (
                                                    <div className="absolute top-8 left-4 z-20 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-widest shadow">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                                        LIVE
                                                    </div>
                                                )}

                                                {/* Frame Contents */}
                                                <div className="flex-1 w-full h-full relative">
                                                    {activeIsTikTokLive ? (
                                                        /* Custom High-Fidelity TikTok Live Mockup Screen */
                                                        <div className="absolute inset-0 bg-gradient-to-b from-[#161823] via-[#010101] to-[#161823] flex flex-col justify-between p-4 text-white font-sans select-none">
                                                            {/* Top Header Row */}
                                                            <div className="flex items-center justify-between mt-5">
                                                                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center font-bold text-white text-[8px] uppercase">
                                                                        {activeStream.title ? activeStream.title[0] : 'i'}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[8px] font-bold leading-tight">iLOOK Store</span>
                                                                        <span className="text-[6px] text-gray-300 leading-none">{getHandle(activeStream.tiktok_url)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 bg-[#fe2c55] text-white text-[8px] font-bold px-1.5 py-1 rounded shadow">
                                                                    <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                                                                    <span>LIVE</span>
                                                                </div>
                                                            </div>

                                                            {/* Center Visual: Large pulsing icon & wave */}
                                                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                                                                <div className="relative">
                                                                    <div className="absolute inset-0 rounded-full bg-[#fe2c55]/20 animate-ping scale-125" />
                                                                    <div className="w-14 h-14 rounded-full border-2 border-[#fe2c55] bg-[#121212] flex items-center justify-center overflow-hidden relative shadow-2xl">
                                                                        <span className="text-white text-xl font-black italic tracking-tighter">iL</span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="text-center space-y-0.5">
                                                                    <p className="text-[10px] font-bold tracking-wide uppercase text-[#fe2c55] animate-pulse">Sedang Berlangsung</p>
                                                                    <p className="text-[8px] text-gray-400 max-w-[140px] mx-auto leading-normal">Preview visualisasi live stream pelanggan</p>
                                                                </div>

                                                                {/* Audio / visual wave indicators */}
                                                                <div className="flex items-end gap-1 h-4 mt-0.5">
                                                                    <span className="w-0.5 bg-[#fe2c55] rounded-full animate-bounce h-2" />
                                                                    <span className="w-0.5 bg-white rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.2s' }} />
                                                                    <span className="w-0.5 bg-[#25f4ee] rounded-full animate-bounce h-3" style={{ animationDelay: '0.4s' }} />
                                                                    <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDelay: '0.1s' }} />
                                                                </div>
                                                            </div>

                                                            {/* Bottom Action Area */}
                                                            <div className="flex flex-col gap-2 pb-2">
                                                                <div className="w-full bg-[#fe2c55] text-white py-2 text-[9px] font-bold rounded-lg text-center shadow-lg border border-red-400/10 uppercase tracking-widest flex items-center justify-center gap-1">
                                                                    <span>Tonton Live di TikTok</span>
                                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <iframe
                                                            src={activeStream.embed_url}
                                                            className="w-full h-full border-none bg-black"
                                                            allowFullScreen
                                                            scrolling="no"
                                                            allow="autoplay; encrypted-media;"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 text-center px-4 leading-normal">
                                                Ini adalah visualisasi tampilan vertical di smartphone storefront pelanggan.
                                            </span>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-300">
                                        <Video className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-600 text-sm">Tidak Ada Stream Aktif</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">
                                            Aktifkan salah satu link livestreaming untuk menampilkan preview dan mempublikasikannya ke storefront.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
                        {/* Title bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 font-outfit">
                                {editMode ? 'Edit Tautan Livestream' : 'Tambah Tautan Livestream Baru'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveStream} className="flex flex-col gap-4">
                            {/* Title field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul / Label Identifikasi</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Live TikTok Promo Awal Bulan"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all text-gray-800"
                                    required
                                />
                                {errors.title && (
                                    <span className="text-xs text-red-500 font-medium">{errors.title}</span>
                                )}
                            </div>

                            {/* URL field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tautan TikTok (Live / Video)</label>
                                <input
                                    type="url"
                                    placeholder="https://www.tiktok.com/@username/live"
                                    value={data.tiktok_url}
                                    onChange={e => setData('tiktok_url', e.target.value)}
                                    className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all font-mono text-xs text-gray-800"
                                    required
                                />
                                {errors.tiktok_url && (
                                    <span className="text-xs text-red-500 font-medium">{errors.tiktok_url}</span>
                                )}
                            </div>

                            {/* Active Toggle Switch */}
                            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200/50 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-800">Set Aktif Langsung</span>
                                    <span className="text-[10px] text-gray-400">Aktifkan link ini di storefront (menonaktifkan link lain).</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center justify-center min-w-[100px]"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
