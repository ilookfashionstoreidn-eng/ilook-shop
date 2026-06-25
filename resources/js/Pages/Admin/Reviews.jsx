import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    X,
    Star,
    Calendar,
    MessageSquare,
    User,
    Check,
    AlertCircle
} from 'lucide-react';

export default function Reviews({ reviews, products, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRating, setSelectedRating] = useState(filters.rating || '');
    const [selectedProduct, setSelectedProduct] = useState(filters.product_id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentReviewId, setCurrentReviewId] = useState(null);

    // Form setup using Inertia useForm helper
    const { data, setData, post, put, delete: destroy, errors, reset, processing } = useForm({
        product_id: '',
        user_name: '',
        rating: 5,
        comment: '',
        review_date: new Date().toISOString().split('T')[0] // default to today YYYY-MM-DD
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleApplyFilters = () => {
        router.get(route('admin.reviews'), {
            search: searchTerm,
            rating: selectedRating,
            product_id: selectedProduct
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedRating('');
        setSelectedProduct('');
        router.get(route('admin.reviews'));
    };

    const openCreateModal = () => {
        reset();
        setData({
            product_id: products[0]?.id || '',
            user_name: '',
            rating: 5,
            comment: '',
            review_date: new Date().toISOString().split('T')[0]
        });
        setEditMode(false);
        setCurrentReviewId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (review) => {
        setEditMode(true);
        setCurrentReviewId(review.id);

        setData({
            product_id: review.product_id,
            user_name: review.user_name,
            rating: review.rating,
            comment: review.comment || '',
            review_date: review.review_date 
                ? new Date(review.review_date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        });

        setIsModalOpen(true);
    };

    const handleSaveReview = (e) => {
        e.preventDefault();

        if (editMode) {
            put(route('admin.reviews.update', currentReviewId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('admin.reviews.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDeleteReview = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus rating/ulasan ini?')) {
            destroy(route('admin.reviews.destroy', id));
        }
    };

    // Render stars helper
    const renderStars = (count, size = "w-4 h-4") => {
        return (
            <div className="flex items-center text-amber-400 gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`${size} ${s <= count ? 'fill-amber-400' : 'text-gray-250'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Kelola Review Palsu iLook" />

            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Review & Rating Pembeli</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Tambahkan fake rating dan ulasan pada produk agar terlihat ramai pembeli di halaman detail produk.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={openCreateModal}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md"
                        >
                            <Plus className="w-4.5 h-4.5" />
                            <span>Tambah Ulasan</span>
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col lg:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama reviewer, isi ulasan..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl pl-10 pr-4 py-2.5 text-gray-800 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700 w-full sm:w-60"
                        >
                            <option value="">Semua Produk</option>
                            {products.map(prod => (
                                <option key={prod.id} value={prod.id}>{prod.name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(e.target.value)}
                            className="bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700 w-full sm:w-40"
                        >
                            <option value="">Semua Rating</option>
                            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                            <option value="4">⭐⭐⭐⭐ (4)</option>
                            <option value="3">⭐⭐⭐ (3)</option>
                            <option value="2">⭐⭐ (2)</option>
                            <option value="1">⭐ (1)</option>
                        </select>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleApplyFilters}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
                            >
                                <Filter className="w-4 h-4 text-emerald-600" />
                                <span>Filter</span>
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shadow-sm"
                                title="Reset Filter"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Table Card */}
                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto min-w-full">
                        <table className="min-w-full admin-table">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left">Produk</th>
                                    <th className="px-6 py-4 text-left">Nama Reviewer</th>
                                    <th className="px-6 py-4 text-left">Rating</th>
                                    <th className="px-6 py-4 text-left">Komentar Ulasan</th>
                                    <th className="px-6 py-4 text-left">Tanggal Review</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-medium">
                                            Tidak ada ulasan ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.data.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50/40 border-b border-gray-100 last:border-0">
                                            <td className="px-6 py-4 font-semibold text-gray-800 text-sm max-w-xs truncate">
                                                {review.product?.name || <span className="text-red-500">Produk Terhapus</span>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-medium text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase border border-emerald-100">
                                                        {review.user_name[0]}
                                                    </div>
                                                    <span>{review.user_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {renderStars(review.rating, "w-4 h-4")}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm max-w-md">
                                                {review.comment ? (
                                                    <span className="line-clamp-2" title={review.comment}>
                                                        {review.comment}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 italic">Tanpa komentar ulasan</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-medium font-mono">
                                                {new Date(review.review_date || review.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(review)}
                                                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm"
                                                        title="Edit Ulasan"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                                                        title="Hapus Ulasan"
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

                    {/* Pagination */}
                    {reviews.links && reviews.links.length > 3 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Menampilkan {reviews.from || 0} - {reviews.to || 0} dari {reviews.total} ulasan
                            </span>
                            <div className="flex items-center gap-1">
                                {reviews.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            link.active
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : link.url
                                                    ? 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                                    : 'border-transparent text-gray-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="relative w-full max-w-lg rounded-2xl border border-gray-150 bg-white p-6 shadow-2xl flex flex-col z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit">
                                {editMode ? 'Ubah Ulasan / Rating' : 'Tambah Ulasan Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveReview} className="space-y-5 text-gray-650">
                            {/* Product Selection */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Pilih Produk</label>
                                <select
                                    required
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700"
                                >
                                    <option value="" disabled>Pilih Produk</option>
                                    {products.map(prod => (
                                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-xs text-red-500">{errors.product_id}</p>}
                            </div>

                            {/* Reviewer Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Nama Reviewer (Pembeli)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Sarah Wijaya"
                                        value={data.user_name}
                                        onChange={e => setData('user_name', e.target.value)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl pl-10 pr-4 py-2.5 text-gray-850"
                                    />
                                </div>
                                {errors.user_name && <p className="text-xs text-red-500">{errors.user_name}</p>}
                            </div>

                            {/* Rating Stars Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase block">Rating Bintang</label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${
                                                    star <= data.rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300 hover:text-amber-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && <p className="text-xs text-red-500">{errors.rating}</p>}
                            </div>

                            {/* Comment */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Isi Ulasan / Komentar (Opsional)</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea
                                        rows="3"
                                        placeholder="Tuliskan ulasan mengenai produk ini..."
                                        value={data.comment}
                                        onChange={e => setData('comment', e.target.value)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl pl-10 pr-4 py-2.5 text-gray-800 font-sans"
                                    />
                                </div>
                                {errors.comment && <p className="text-xs text-red-500">{errors.comment}</p>}
                            </div>

                            {/* Review Date */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Tanggal Review (Opsional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={data.review_date}
                                        onChange={e => setData('review_date', e.target.value)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl pl-10 pr-4 py-2.5 text-gray-800 font-mono"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Kosongkan/pilih tanggal yang diinginkan. Fitur ini berguna untuk backdating ulasan agar terlihat natural.</p>
                                {errors.review_date && <p className="text-xs text-red-500">{errors.review_date}</p>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md flex items-center gap-1.5"
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
