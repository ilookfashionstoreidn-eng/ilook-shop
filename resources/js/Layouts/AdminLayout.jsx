import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    FolderTree,
    Boxes,
    ReceiptText,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    Bell,
    ChevronRight,
    Search,
    Sparkles,
    Star,
    Tag,
    MessageSquare,
    CreditCard,
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const { auth, flash = {} } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const url = usePage().url;

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, route: 'admin.dashboard', path: '/admin' },
        { name: 'Produk iLook', icon: ShoppingBag, route: 'admin.products', path: '/admin/products' },
        { name: 'Flash Sale', icon: Sparkles, route: 'admin.flash-sales', path: '/admin/flash-sales' },
        { name: 'Kategori', icon: FolderTree, route: 'admin.categories', path: '/admin/categories' },
        { name: 'Manajemen Stok', icon: Boxes, route: 'admin.stocks', path: '/admin/stocks' },
        { name: 'Pesanan Masuk', icon: ReceiptText, route: 'admin.orders', path: '/admin/orders' },
        { name: 'Manajemen User', icon: User, route: 'admin.users', path: '/admin/users' },
        { name: 'Review Pembeli', icon: Star, route: 'admin.reviews', path: '/admin/reviews' },
        { name: 'Kupon Diskon', icon: Tag, route: 'admin.coupons', path: '/admin/coupons' },
        { name: 'Chat Pembeli', icon: MessageSquare, route: 'admin.chats', path: '/admin/chats' },
        { name: 'Manajemen Rekening', icon: CreditCard, route: 'admin.payments', path: '/admin/payments' },
        { name: 'Pengaturan Toko', icon: Settings, route: 'admin.settings', path: '/admin/settings' },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const currentPageName = () => {
        const seg = url.split('/')[2];
        if (!seg) return 'Dashboard';
        return seg.charAt(0).toUpperCase() + seg.slice(1);
    };

    return (
        <div className="admin-root min-h-screen flex font-sans overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Overlay mobile ── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ═══════════════════════════════
                SIDEBAR
            ═══════════════════════════════ */}
            <aside
                className={`
                    admin-sidebar fixed inset-y-0 left-0 z-40 w-64 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:h-screen
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">iL</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-900 text-[15px] leading-none tracking-tight">
                                iLook Fashion
                            </span>
                            <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">
                                Admin Panel
                            </p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    {/* Label */}
                    <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-3">
                        Store Manager
                    </p>

                    <div className="space-y-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.path === '/admin'
                                ? (url === '/admin' || url.startsWith('/admin?'))
                                : (url === item.path || url.startsWith(item.path + '/') || url.startsWith(item.path + '?'));
                            return (
                                <Link
                                    key={item.name}
                                    href={route(item.route)}
                                    className={`admin-nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon
                                        className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}
                                    />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Footer */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 uppercase shadow-sm">
                            {auth?.user?.name ? auth.user.name[0] : 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 truncate leading-tight">
                                {auth?.user?.name || 'Administrator'}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {auth?.user?.email || 'admin@ilookfashion.com'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Panel</span>
                    </button>
                </div>
            </aside>

            {/* ═══════════════════════════════
                MAIN AREA
            ═══════════════════════════════ */}
            <div className="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-hidden">

                {/* TOP BAR */}
                <header className="admin-topbar h-16 flex items-center justify-between px-5 md:px-7 z-30 flex-shrink-0">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400">
                            <span className="text-gray-400">Admin</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-gray-800 font-semibold">{currentPageName()}</span>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 text-sm w-52">
                            <Search className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs text-gray-400">Cari sesuatu...</span>
                        </div>

                        {/* Notif Bell */}
                        <div className="relative">
                            <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                            </button>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all shadow-sm"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-xs uppercase">
                                    {auth?.user?.name ? auth.user.name[0] : 'A'}
                                </div>
                                <span className="text-sm font-medium hidden md:inline text-gray-700">
                                    {auth?.user?.name || 'Admin'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90 hidden md:inline" />
                            </button>

                            {showProfileDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-xl p-1.5 z-50">
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                                        >
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span>Profil Saya</span>
                                        </Link>
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-5 md:p-7" style={{ background: '#f0f2f5' }}>
                    {/* Flash success */}
                    {flash?.success && (
                        <div className="mb-5 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-3">
                            <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                            <span className="text-sm font-medium">{flash.success}</span>
                        </div>
                    )}
                    {/* Flash error */}
                    {flash?.error && (
                        <div className="mb-5 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 flex items-center gap-3">
                            <span className="text-sm font-medium">{flash.error}</span>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
