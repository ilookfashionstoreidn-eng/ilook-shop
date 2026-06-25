import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Shield,
    X,
    Search,
    Lock,
} from 'lucide-react';

export default function Users({ users, filters }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const { data, setData, post, put, delete: destroy, errors, reset, processing } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'buyer',
        password: '',
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRoleFilterChange = (e) => {
        const val = e.target.value;
        setRoleFilter(val);
        router.get(route('admin.users'), { search: searchTerm, role: val }, { preserveState: true });
    };

    const handleApplyFilters = () => {
        router.get(route('admin.users'), { search: searchTerm, role: roleFilter }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        router.get(route('admin.users'));
    };

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setCurrentUserId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditMode(true);
        setCurrentUserId(user.id);
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            password: '',
        });
        setIsModalOpen(true);
    };

    const handleSaveUser = (e) => {
        e.preventDefault();

        if (editMode) {
            put(route('admin.users.update', currentUserId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteUser = (user) => {
        if (user.id === auth.user.id) {
            alert('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) {
            destroy(route('admin.users.destroy', user.id));
        }
    };

    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return <span className="badge badge-indigo">Admin</span>;
        }
        return <span className="badge badge-gray">Buyer</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen User — iLook Admin" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-outfit">Manajemen User</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Kelola data administrator dan pembeli toko iLook Fashion.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md font-sans"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Tambah User</span>
                    </button>
                </div>

                {/* Filters and List */}
                <div className="admin-card p-6 flex flex-col gap-5">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                            {/* Search bar */}
                            <div className="relative flex items-center flex-1 sm:flex-initial">
                                <Search className="absolute left-3 w-4 h-4 text-gray-405" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, email, HP..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                    className="bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs rounded-xl pl-9 pr-8 py-2.5 text-gray-800 w-full sm:w-64"
                                />
                                {searchTerm && (
                                    <button onClick={handleResetFilters} className="absolute right-3 text-gray-455 hover:text-gray-655">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Role filter */}
                            <select
                                value={roleFilter}
                                onChange={handleRoleFilterChange}
                                className="bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs rounded-xl px-3 py-2.5 text-gray-700"
                            >
                                <option value="">Semua Peran</option>
                                <option value="admin">Admin</option>
                                <option value="buyer">Buyer</option>
                            </select>

                            <button
                                onClick={handleApplyFilters}
                                className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto min-w-full">
                        <table className="min-w-full admin-table">
                            <thead>
                                <tr>
                                    <th className="text-left w-12">User</th>
                                    <th className="text-left">Nama</th>
                                    <th className="text-left">Email</th>
                                    <th className="text-left">Nomor HP</th>
                                    <th className="text-left">Peran</th>
                                    <th className="text-left">Terdaftar</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-450 font-medium">Tidak ada user ditemukan.</td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 uppercase shadow-sm">
                                                    {user.name ? user.name[0] : 'U'}
                                                </div>
                                            </td>
                                            <td className="font-semibold text-gray-800">
                                                <div className="flex items-center gap-1.5">
                                                    {user.name}
                                                    {user.id === auth.user.id && (
                                                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-1.5 py-0.5 rounded border border-emerald-100">Saya</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-gray-600 font-mono text-xs">{user.email}</td>
                                            <td className="text-gray-500">{user.phone || '-'}</td>
                                            <td>{getRoleBadge(user.role)}</td>
                                            <td className="text-gray-500">{formatDate(user.created_at)}</td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-850 hover:border-gray-300 transition-all shadow-sm"
                                                        title="Ubah Profil"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={user.id === auth.user.id}
                                                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-all shadow-sm"
                                                        title={user.id === auth.user.id ? "Tidak dapat menghapus diri sendiri" : "Hapus User"}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
                    {users.links && users.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                            <span className="text-xs text-gray-400">
                                Halaman {users.current_page} dari {users.last_page} (Total {users.total} user)
                            </span>
                            <div className="flex items-center gap-1">
                                {users.links.map((link) => (
                                    <button
                                        key={link.label}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url, { search: searchTerm, role: roleFilter }, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            !link.url
                                                ? 'opacity-40 cursor-default bg-gray-50 text-gray-400 border-gray-200'
                                                : link.active
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-650 hover:text-gray-850 hover:bg-gray-55'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE / EDIT USER MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h2 className="text-lg font-bold text-gray-900 font-outfit">
                                {editMode ? 'Ubah Akun User' : 'Tambah User Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="space-y-4 text-gray-600 text-sm">
                            {/* Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-gray-400" /> Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-850"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Alamat Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Contoh: budi@gmail.com"
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-850"
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Nomor HP
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-850"
                                />
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                            </div>

                            {/* Role */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-gray-400" /> Hak Akses / Peran
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-850"
                                >
                                    <option value="buyer">Buyer (Customer)</option>
                                    <option value="admin">Admin (Administrator)</option>
                                </select>
                                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-gray-400" /> Password
                                </label>
                                <input
                                    type="password"
                                    required={!editMode}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={editMode ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password (min. 8 karakter)"}
                                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-850"
                                />
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all font-sans"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50 shadow-sm font-sans"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
