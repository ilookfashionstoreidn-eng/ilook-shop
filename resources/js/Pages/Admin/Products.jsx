import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Image as ImageIcon,
    AlertCircle,
    X,
    Boxes,
    Check,
    ArrowRightLeft,
    Tag,
    Video,
    Upload,
} from 'lucide-react';
import axios from 'axios';

export default function Products({ products, categories, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [syncingId, setSyncingId] = useState(null);
    const [syncingAll, setSyncingAll] = useState(false);
    const [expandedProducts, setExpandedProducts] = useState({});
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            alert('File video terlalu besar. Batas maksimal adalah 20MB.');
            return;
        }

        const formData = new FormData();
        formData.append('video', file);

        setUploadingVideo(true);
        setUploadProgress(0);

        try {
            const response = await axios.post(route('admin.products.upload-video'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            if (response.data && response.data.success) {
                setData('video_url', response.data.url);
            } else {
                alert('Gagal mengunggah video.');
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            const msg = error.response?.data?.message || 'Terjadi kesalahan saat mengunggah video.';
            alert(msg);
        } finally {
            setUploadingVideo(false);
        }
    };

    const toggleExpandProduct = (productId) => {
        setExpandedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    // Form setup using Inertia useForm helper
    const { data, setData, post, put, delete: destroy, errors, reset, processing } = useForm({
        name: '',
        category_id: '',
        description: '',
        sku: '',
        weight: 0,
        length: '',
        width: '',
        height: '',
        base_price: 0,
        sale_price: '',
        status: 'active',
        images: [],
        video_url: '',
        variants: [
            { name: 'Default', sku: '', price: '', stock: 10, image: '' }
        ]
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleApplyFilters = () => {
        router.get(route('admin.products'), {
            search: searchTerm,
            category_id: selectedCategory,
            status: selectedStatus
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('');
        router.get(route('admin.products'));
    };

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setCurrentProductId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditMode(true);
        setCurrentProductId(product.id);

        setData({
            name: product.name,
            category_id: product.category_id || '',
            description: product.description || '',
            sku: product.sku || '',
            weight: product.weight,
            length: product.length || '',
            width: product.width || '',
            height: product.height || '',
            base_price: product.base_price,
            sale_price: product.sale_price || '',
            status: product.status,
            images: product.images || [],
            video_url: product.video_url || '',
            variants: product.variants.map(v => ({
                id: v.id,
                sku: v.sku,
                name: v.name,
                price: v.price || '',
                stock: v.stock,
                image: v.image || ''
            }))
        });

        setIsModalOpen(true);
    };

    const handleSaveProduct = (e) => {
        e.preventDefault();

        if (editMode) {
            put(route('admin.products.update', currentProductId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('admin.products.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDeleteProduct = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini? Semua varian dan stok di dalamnya juga akan terhapus.')) {
            destroy(route('admin.products.destroy', id));
        }
    };

    const handleSyncGinee = (id, action) => {
        setSyncingId(id);
        router.post(route('admin.products.sync-ginee', id), { action }, {
            onFinish: () => setSyncingId(null)
        });
    };

    const handleSyncAllGinee = () => {
        setSyncingAll(true);
        router.post(route('admin.products.sync-all-ginee'), {}, {
            onFinish: () => setSyncingAll(false)
        });
    };

    // Variant Helper functions
    const addVariantRow = () => {
        setData('variants', [
            ...data.variants,
            { sku: '', name: '', price: '', stock: 10, image: '' }
        ]);
    };

    const removeVariantRow = (index) => {
        const list = [...data.variants];
        list.splice(index, 1);
        setData('variants', list);
    };

    const handleVariantChange = (index, field, value) => {
        const list = [...data.variants];
        list[index][field] = value;
        setData('variants', list);
    };

    const autoGenerateSKU = () => {
        const baseSKU = data.sku || data.name.substring(0, 3).toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
        if (!baseSKU) return;

        const updated = data.variants.map((v, idx) => {
            const suffix = v.name ? v.name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '-') : idx;
            return {
                ...v,
                sku: `${baseSKU}-${suffix}`
            };
        });
        setData('variants', updated);
    };

    return (
        <AdminLayout>
            <Head title="Kelola Produk iLook" />

            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Katalog Produk</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Kelola data produk, varian ukuran/warna, stok gudang, dan sinkronisasi omnichannel Ginee.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleSyncAllGinee}
                            disabled={syncingAll}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all border border-indigo-200"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
                            <span>Tarik Produk Ginee</span>
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md"
                        >
                            <Plus className="w-4.5 h-4.5" />
                            <span>Tambah Produk</span>
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama produk, SKU..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl pl-10 pr-4 py-2.5 text-gray-800 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700 w-full md:w-44"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700 w-full md:w-40"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                            <option value="out_of_stock">Stok Habis</option>
                        </select>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={handleApplyFilters}
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
                            >
                                <Filter className="w-4 h-4 text-emerald-600" />
                                <span>Filter</span>
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-650 hover:bg-gray-50 shadow-sm"
                                title="Reset Filter"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Table Card */}
                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto min-w-full">
                        <table className="min-w-full admin-table">
                            <thead>
                                <tr>
                                    <th className="px-4 py-4 w-12 text-center">
                                        <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    </th>
                                    <th className="px-6 py-4 text-left">Master Products & Image</th>
                                    <th className="px-6 py-4 text-left">SKU Induk</th>
                                    <th className="px-6 py-4 text-left">Kategori</th>
                                    <th className="px-6 py-4 text-left">Harga Dasar</th>
                                    <th className="px-6 py-4 text-left">Variation</th>
                                    <th className="px-6 py-4 text-left">MSKU</th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-1">
                                            <span>Available Stock</span>
                                            <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-1">
                                            <span>Stock Status</span>
                                            <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-8 text-center text-gray-400 font-medium">
                                            Tidak ada produk ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.flatMap((product) => {
                                        const variants = product.variants && product.variants.length > 0
                                            ? product.variants
                                            : [{ id: `dummy-${product.id}`, name: 'Default', sku: product.sku || '-', stock: 0 }];
                                        
                                        const hasManyVariants = variants.length > 3;
                                        const isExpanded = !!expandedProducts[product.id];
                                        const displayedVariants = hasManyVariants && !isExpanded
                                            ? variants.slice(0, 3)
                                            : variants;
                                        
                                        const totalRows = displayedVariants.length + (hasManyVariants ? 1 : 0);
                                        
                                        const rows = displayedVariants.map((variant, index) => {
                                            const isFirst = index === 0;
                                            const isLastVariant = index === displayedVariants.length - 1;
                                            const isLastRow = isLastVariant && !hasManyVariants;
                                            
                                            return (
                                                <tr key={`${product.id}-${variant.id}`} className="hover:bg-gray-50/40">
                                                    {isFirst && (
                                                        <>
                                                            <td rowSpan={totalRows} className="px-4 py-4 w-12 text-center align-middle border-r border-gray-100 bg-white">
                                                                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                                            </td>
                                                            <td rowSpan={totalRows} className="px-6 py-4 align-middle border-r border-gray-100 bg-white">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                                        {product.images && product.images[0] ? (
                                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 max-w-[220px]" title={product.name}>
                                                                            {product.name}
                                                                        </h4>
                                                                        {product.ginee_product_id && (
                                                                            <div className="text-[9px] text-gray-400 font-mono mt-0.5">Ginee: {product.ginee_product_id}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td rowSpan={totalRows} className="px-6 py-4 align-middle border-r border-gray-100 bg-white font-mono text-gray-500 text-xs">
                                                                {product.sku || '-'}
                                                            </td>
                                                            <td rowSpan={totalRows} className="px-6 py-4 align-middle border-r border-gray-100 bg-white">
                                                                {product.category ? (
                                                                    <span className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                                                                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                                                        {product.category.name}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td rowSpan={totalRows} className="px-6 py-4 align-middle border-r border-gray-100 bg-white font-medium text-gray-800">
                                                                {formatCurrency(product.base_price)}
                                                                {product.sale_price && (
                                                                    <div className="text-[10px] text-red-500 line-through">
                                                                        {formatCurrency(product.sale_price)}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                    
                                                    {/* Variant details */}
                                                    <td className={`px-6 py-4 text-gray-700 font-medium ${isLastRow ? "border-b border-gray-250" : "border-b border-dashed border-gray-200"}`}>
                                                        {variant.name}
                                                    </td>
                                                    <td className={`px-6 py-4 font-mono text-gray-500 text-xs ${isLastRow ? "border-b border-gray-250" : "border-b border-dashed border-gray-200"}`}>
                                                        {variant.sku || '-'}
                                                    </td>
                                                    <td className={`px-6 py-4 ${isLastRow ? "border-b border-gray-250" : "border-b border-dashed border-gray-200"}`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold text-xs sm:text-sm ${variant.stock === 0 ? 'text-red-500' : 'text-gray-855'}`}>
                                                                {variant.stock}
                                                            </span>
                                                            <button
                                                                onClick={() => openEditModal(product)}
                                                                className="text-gray-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                                                                title="Edit Detail Produk"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSyncGinee(product.id, 'pull')}
                                                                disabled={syncingId === product.id}
                                                                className={`text-gray-400 hover:text-emerald-600 p-0.5 rounded transition-colors ${syncingId === product.id ? 'animate-spin' : ''}`}
                                                                title="Tarik Stok Terkini dari Ginee"
                                                            >
                                                                <RefreshCw className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 ${isLastRow ? "border-b border-gray-250" : "border-b border-dashed border-gray-200"}`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-600 border border-blue-150 hover:bg-blue-100 transition-colors cursor-pointer">
                                                                Warehouse
                                                            </span>
                                                            {product.status === 'active' ? (
                                                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-150 hover:bg-emerald-100 transition-colors cursor-pointer">
                                                                    Enable
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                                                                    Disable
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    
                                                    {isFirst && (
                                                        <td rowSpan={totalRows} className="px-6 py-4 text-right align-middle whitespace-nowrap bg-white border-l border-gray-100">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => handleSyncGinee(product.id, 'push')}
                                                                    disabled={syncingId === product.id}
                                                                    className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm ${syncingId === product.id ? 'animate-spin' : ''}`}
                                                                    title="Push / Sync ke Ginee"
                                                                >
                                                                    <ArrowRightLeft className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => openEditModal(product)}
                                                                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm"
                                                                    title="Edit Produk"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteProduct(product.id)}
                                                                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                                                                    title="Hapus Produk"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        });

                                        if (hasManyVariants) {
                                            rows.push(
                                                <tr key={`${product.id}-toggle`} className="hover:bg-gray-50/20 bg-gray-50/5">
                                                    <td colSpan="4" className="px-6 py-2.5 text-left border-b border-gray-250">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleExpandProduct(product.id)}
                                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 transition-all"
                                                        >
                                                            {isExpanded ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua Varian (+${variants.length - 3} Varian)`}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return rows;
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.links && products.links.length > 3 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Menampilkan {products.from || 0} - {products.to || 0} dari {products.total} produk
                            </span>
                            <div className="flex items-center gap-1">
                                {products.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            link.active
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : link.url
                                                    ? 'bg-white border-gray-200 text-gray-500 hover:text-gray-850 hover:bg-gray-50'
                                                    : 'border-transparent text-gray-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE / EDIT PRODUCT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="relative w-full max-w-4xl rounded-2xl border border-gray-150 bg-white p-6 shadow-2xl flex flex-col max-h-[90vh] z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit">
                                {editMode ? 'Ubah Detail Produk' : 'Tambah Produk Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Scroll Content */}
                        <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto pr-2 space-y-6 text-gray-650">
                            {/* General Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Nama Produk</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-850"
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Kategori</label>
                                    <select
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">SKU Induk (Base SKU)</label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        placeholder="Contoh: DRS-SATIN"
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 font-mono"
                                    />
                                    {errors.sku && <p className="text-xs text-red-500">{errors.sku}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Status Publikasi</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-700"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Nonaktif</option>
                                        <option value="out_of_stock">Stok Habis</option>
                                    </select>
                                    {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                                </div>
                            </div>

                            {/* Logistics Details */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                    Detail Pengiriman & Dimensi (Raja Ongkir)
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Berat (Gram)</label>
                                        <input
                                            type="number"
                                            required
                                            value={data.weight}
                                            onChange={e => setData('weight', parseInt(e.target.value) || 0)}
                                            className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2 text-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Panjang (cm)</label>
                                        <input
                                            type="number"
                                            value={data.length}
                                            onChange={e => setData('length', e.target.value)}
                                            className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2 text-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Lebar (cm)</label>
                                        <input
                                            type="number"
                                            value={data.width}
                                            onChange={e => setData('width', e.target.value)}
                                            className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2 text-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Tinggi (cm)</label>
                                        <input
                                            type="number"
                                            value={data.height}
                                            onChange={e => setData('height', e.target.value)}
                                            className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2 text-gray-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Harga Normal (IDR)</label>
                                    <input
                                        type="number"
                                        required
                                        value={data.base_price}
                                        onChange={e => setData('base_price', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                    />
                                    {errors.base_price && <p className="text-xs text-red-500">{errors.base_price}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Harga Coret / Promo (IDR)</label>
                                    <input
                                        type="number"
                                        value={data.sale_price}
                                        onChange={e => setData('sale_price', e.target.value)}
                                        placeholder="Kosongkan jika tidak ada promo"
                                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                    />
                                    {errors.sale_price && <p className="text-xs text-red-500">{errors.sale_price}</p>}
                                </div>
                            </div>

                            {/* Description rich textarea */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Deskripsi Produk (HTML format)</label>
                                <textarea
                                    rows="4"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Tuliskan deskripsi lengkap produk..."
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 font-sans"
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>

                            {/* Images configuration */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-400 uppercase block">Foto Produk (Mock URL list)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Image URL 1"
                                        value={data.images[0] || ''}
                                        onChange={e => {
                                            const updated = [...data.images];
                                            updated[0] = e.target.value;
                                            setData('images', updated);
                                        }}
                                        className="bg-white border border-gray-200 text-xs rounded-lg p-2 text-gray-755"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Image URL 2"
                                        value={data.images[1] || ''}
                                        onChange={e => {
                                            const updated = [...data.images];
                                            updated[1] = e.target.value;
                                            setData('images', updated);
                                        }}
                                        className="bg-white border border-gray-200 text-xs rounded-lg p-2 text-gray-755"
                                    />
                                </div>
                            </div>

                            {/* Video Configuration */}
                            <div className="p-4 rounded-xl border border-gray-150 bg-gray-50/30 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Video className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-sm font-bold text-gray-800">Video Produk</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">URL Video (YouTube / Direct Link)</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: https://www.youtube.com/watch?v=..."
                                            value={data.video_url || ''}
                                            onChange={e => setData('video_url', e.target.value)}
                                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 font-sans"
                                        />
                                        {errors.video_url && <p className="text-xs text-red-500">{errors.video_url}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Unggah File Video (.mp4, .mov, max 20MB)</label>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl cursor-pointer text-xs font-semibold text-gray-600 transition-all flex-1">
                                                <Upload className="w-4 h-4 text-indigo-500" />
                                                <span>{uploadingVideo ? 'Mengunggah...' : 'Pilih & Unggah Video'}</span>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoUpload}
                                                    disabled={uploadingVideo}
                                                    className="hidden"
                                                />
                                            </label>
                                            {data.video_url && (
                                                <button
                                                    type="button"
                                                    onClick={() => setData('video_url', '')}
                                                    className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 text-xs font-bold rounded-xl border border-red-150 transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                                <div className="bg-indigo-650 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {data.video_url && (
                                    <div className="p-3 bg-white rounded-lg border border-gray-100 flex items-center gap-3">
                                        <span className="text-xs font-semibold text-gray-400">Aktif:</span>
                                        <span className="text-xs text-indigo-650 font-mono truncate flex-1">{data.video_url}</span>
                                        <div className="w-12 h-8 bg-gray-100 rounded border overflow-hidden flex items-center justify-center flex-shrink-0">
                                            <Video className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Variants Setup */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">Konfigurasi Varian Produk</h3>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Wajib memiliki minimal 1 varian (isi nama "Default" jika tidak ada opsi khusus)</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={autoGenerateSKU}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-indigo-750"
                                        >
                                            Auto-generate SKU Varian
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addVariantRow}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Varian</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {data.variants.map((variant, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm relative">
                                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-5 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Nama Varian (Contoh: S / Hitam)</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Varian"
                                                        value={variant.name}
                                                        onChange={e => handleVariantChange(idx, 'name', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 text-xs rounded-lg p-2 text-gray-800"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">SKU Varian (Karakter Unik)</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="SKU"
                                                        value={variant.sku}
                                                        onChange={e => handleVariantChange(idx, 'sku', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 text-xs rounded-lg p-2 text-gray-800 font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Harga Custom (Kosongkan = default)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Harga custom"
                                                        value={variant.price}
                                                        onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 text-xs rounded-lg p-2 text-gray-800"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Stok Gudang (Awal)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        placeholder="Stok"
                                                        value={variant.stock}
                                                        onChange={e => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                                                        className="w-full bg-white border border-gray-200 text-xs rounded-lg p-2 text-gray-800"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3 text-indigo-500" /> Foto Varian (URL)
                                                    </label>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="text"
                                                            placeholder="https://..."
                                                            value={variant.image || ''}
                                                            onChange={e => handleVariantChange(idx, 'image', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 text-xs rounded-lg p-2 text-gray-850 font-mono"
                                                        />
                                                        {variant.image && (
                                                            <img
                                                                src={variant.image}
                                                                alt="preview"
                                                                className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0"
                                                                onError={e => e.target.style.display = 'none'}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {data.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariantRow(idx)}
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 mt-4 sm:mt-0"
                                                    title="Hapus Varian"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {errors.variants && <p className="text-xs text-red-500 font-semibold">{errors.variants}</p>}
                                </div>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50"
                                >
                                    {editMode ? 'Simpan Perubahan' : 'Tambah Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
