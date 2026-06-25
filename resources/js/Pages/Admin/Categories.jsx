import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    Folder,
    ChevronRight,
    X,
    FolderOpen,
    Image as ImageIcon,
    Tag,
} from 'lucide-react';

export default function Categories({ categories, parentCategories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);

    const { data, setData, post, put, delete: destroy, errors, reset, processing } = useForm({
        name: '',
        parent_id: '',
        sort_order: 0,
        image_url: '',
    });

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setCurrentCategoryId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditMode(true);
        setCurrentCategoryId(category.id);
        setData({
            name: category.name,
            parent_id: category.parent_id || '',
            sort_order: category.sort_order,
            image_url: category.image_url || '',
        });
        setIsModalOpen(true);
    };

    const handleSaveCategory = (e) => {
        e.preventDefault();

        if (editMode) {
            put(route('admin.categories.update', currentCategoryId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.categories.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteCategory = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua kategori anak di dalamnya juga akan terhapus.')) {
            destroy(route('admin.categories.destroy', id));
        }
    };

    // Build categories nesting structure for display
    const buildCategoryTree = () => {
        const rootCategories = categories.filter((c) => !c.parent_id);

        return rootCategories.map((root) => {
            const children = categories.filter((c) => c.parent_id === root.id);
            return {
                ...root,
                children: children,
            };
        });
    };

    const categoryTree = buildCategoryTree();

    return (
        <AdminLayout>
            <Head title="Kelola Kategori iLook" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Kategori</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Kelola struktur kategori pakaian bertingkat untuk pembagian menu di toko iLook.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Tambah Kategori</span>
                    </button>
                </div>

                {/* Categories Structure Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tree View Card */}
                    <div className="admin-card p-6 lg:col-span-2 flex flex-col gap-5">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Struktur Pohon Kategori</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Struktur kategori hirarkis (Induk &gt; Anak)</p>
                        </div>

                        <div className="space-y-4">
                            {categoryTree.length === 0 ? (
                                <div className="text-center text-gray-400 py-8 font-medium">
                                    Belum ada kategori terdaftar.
                                </div>
                            ) : (
                                categoryTree.map((parent) => (
                                    <div key={parent.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                                        {/* Parent Category Card */}
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                                    <FolderOpen className="w-4.5 h-4.5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-sm">{parent.name}</h4>
                                                    <span className="text-[10px] text-gray-400 font-mono">SLUG: {parent.slug} · Urutan: {parent.sort_order}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(parent)}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 transition-all text-xs shadow-sm"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(parent.id)}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 transition-all text-xs shadow-sm"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Child Categories (Subcategories) */}
                                        {parent.children && parent.children.length > 0 && (
                                            <div className="pl-6 border-l-2 border-gray-200/80 space-y-2.5">
                                                {parent.children.map((child) => (
                                                    <div key={child.id} className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-white border border-gray-100">
                                                        <div className="flex items-center gap-2.5">
                                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                                            <Folder className="w-4 h-4 text-indigo-500" />
                                                            <div>
                                                                <span className="font-medium text-gray-700 text-xs">{child.name}</span>
                                                                <span className="text-[9px] text-gray-400 font-mono ml-2">({child.slug}) · Urutan: {child.sort_order}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => openEditModal(child)}
                                                                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCategory(child.id)}
                                                                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Info & Stats Panel */}
                    <div className="admin-card p-6 flex flex-col gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Informasi Kategori</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Panduan penataan katalog toko</p>
                        </div>

                        <div className="space-y-4 text-xs text-gray-500 flex-1">
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                                    <Tag className="w-4.5 h-4.5 text-emerald-600" /> Kategori Induk
                                </span>
                                <p className="leading-relaxed">Kategori induk berada di level teratas pohon kategori (contoh: Pakaian Pria, Pakaian Wanita). Digunakan sebagai navigasi utama header website.</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                                    <ChevronRight className="w-4.5 h-4.5 text-indigo-500" /> Kategori Anak (Subkategori)
                                </span>
                                <p className="leading-relaxed">Kategori anak mengelompokkan produk secara spesifik (contoh: Dress, Kemeja) di bawah Kategori Induk. Wajib memilih kategori anak saat mendefinisikan detail produk.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE / EDIT CATEGORY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-lg font-bold text-gray-900 font-outfit">
                                {editMode ? 'Ubah Kategori' : 'Tambah Kategori'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCategory} className="space-y-4 text-gray-600 text-sm">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Nama Kategori</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Dress Premium"
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Kategori Induk</label>
                                <select
                                    value={data.parent_id}
                                    onChange={(e) => setData('parent_id', e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                >
                                    <option value="">Tidak ada (Jadikan Kategori Induk)</option>
                                    {parentCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.parent_id && <p className="text-xs text-red-500 mt-1">{errors.parent_id}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Urutan Tampil (Sort Order)</label>
                                <input
                                    type="number"
                                    required
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                />
                                {errors.sort_order && <p className="text-xs text-red-500 mt-1">{errors.sort_order}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Gambar / Ikon Kategori (Mock URL)</label>
                                <input
                                    type="text"
                                    value={data.image_url}
                                    onChange={(e) => setData('image_url', e.target.value)}
                                    placeholder="Image URL..."
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
