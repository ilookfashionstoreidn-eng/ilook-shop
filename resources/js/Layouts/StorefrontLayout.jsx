import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, User, LogOut, Lock, Menu, X, Heart } from 'lucide-react';

export default function StorefrontLayout({ children }) {
    const { auth, flash = {}, flashSale } = usePage().props;
    const isHomePage = route().current('storefront.home');
    const [cartCount, setCartCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const updateCartCount = () => {
        try {
            const cart = JSON.parse(localStorage.getItem('ilook_cart') || '[]');
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        } catch (e) {
            setCartCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();
        window.addEventListener('cart-updated', updateCartCount);
        return () => window.removeEventListener('cart-updated', updateCartCount);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSearch(false);
        router.get(route('storefront.home'), { search: searchQuery });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };
    return (
        <div className="min-h-screen bg-white text-[#111111] flex flex-col" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>

            {/* Top Promo Bar */}
            <div className="bg-[#111111] text-white text-[9px] font-bold tracking-[0.2em] uppercase h-9 flex items-center justify-center px-4 w-full select-none sticky top-0 z-50">
                <span>GRATIS ONGKIR DENGAN MINIMAL BELANJA RP 500.000</span>
            </div>

            {/* Navbar — Logo on left, nav in center, actions on right */}
            <header className="bg-white flex justify-between items-center w-full px-4 sm:px-6 md:px-10 h-20 sticky top-9 z-40 border-b border-[#eeeeee]">
                {/* Left: Brand Logo + Mobile Hamburger */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-[#111111] hover:opacity-70 transition-opacity md:hidden"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link href={route('storefront.home')} className="flex items-center">
                        <span className="font-black text-2xl tracking-[0.2em] text-[#111111] uppercase select-none">
                            iLOOK
                        </span>
                    </Link>
                </div>

                {/* Center: Main Navigation Menu (Desktop Only) */}
                <nav className="hidden md:flex gap-8 items-center justify-center flex-1">
                    <Link
                        href={route('storefront.home')}
                        className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#111111] hover:opacity-75 transition-opacity pb-0.5"
                    >
                        WANITA
                    </Link>
                    <Link
                        href={route('storefront.home', { category: 'pakaian-pria' })}
                        className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#666666] hover:text-[#111111] transition-colors duration-200 pb-0.5"
                    >
                        PRIA
                    </Link>
                    <Link
                        href={route('storefront.home', { category: 'dress' })}
                        className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#666666] hover:text-[#111111] transition-colors duration-200 pb-0.5"
                    >
                        DRESS
                    </Link>
                    <Link
                        href={route('storefront.home')}
                        className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#c22e2e] hover:text-[#c22e2e]/80 transition-colors duration-200 pb-0.5"
                    >
                        PROMO
                    </Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="text-[#111111] hover:opacity-70 transition-opacity"
                        title="Cari"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Profile */}
                        {auth?.user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="text-[#111111] hover:opacity-70 transition-opacity flex items-center gap-1.5"
                                    title={auth.user.name}
                                >
                                    <User className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#111111] max-w-[120px] truncate hidden sm:inline-block">
                                        {auth.user.name}
                                    </span>
                                </button>
                                {showProfileMenu && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                                        <div className="absolute right-0 mt-3 w-52 bg-white border border-[#eeeeee] z-40">
                                            <div className="px-4 py-3 border-b border-[#eeeeee]">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#666666]">Halo,</p>
                                                <p className="text-sm font-bold text-[#111111] truncate">{auth.user.name}</p>
                                            </div>
                                            {auth.user.role === 'admin' && (
                                                <Link href={route('admin.dashboard')} className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] hover:bg-[#f3f3f3] text-[#111111] transition-colors">
                                                    <Lock className="w-3.5 h-3.5" />
                                                    <span>Admin Panel</span>
                                                </Link>
                                            )}
                                            <Link href={route('profile.edit')} className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] hover:bg-[#f3f3f3] text-[#111111] transition-colors">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Profil Saya</span>
                                            </Link>
                                            <Link href={route('storefront.my-orders')} className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] hover:bg-[#f3f3f3] text-[#111111] transition-colors">
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                <span>Pesanan Saya</span>
                                            </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-[#530A0C] hover:bg-red-50 transition-colors text-left">
                                                <LogOut className="w-3.5 h-3.5" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href={route('login')} className="text-[#111111] hover:opacity-70 transition-opacity" title="Masuk">
                                <User className="w-5 h-5" />
                            </Link>
                        )}

                        {/* Wishlist placeholder */}
                        <button className="text-[#111111] hover:opacity-70 transition-opacity hidden sm:block">
                            <Heart className="w-5 h-5" />
                        </button>

                        {/* Cart */}
                        <Link
                            href={route('storefront.cart')}
                            className="text-[#111111] hover:opacity-70 transition-opacity relative"
                            title="Keranjang"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            {showSearch && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-24">
                    <div className="bg-white w-full max-w-2xl mx-4">
                        <form onSubmit={handleSearchSubmit} className="flex items-center">
                            <Search className="w-5 h-5 text-[#5d5f5f] mx-4 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                                className="flex-1 py-5 text-sm bg-transparent border-none focus:ring-0 text-[#0a0a0a] placeholder-[#5d5f5f]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSearch(false)}
                                className="p-4 text-[#5d5f5f] hover:text-[#0a0a0a]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-white flex flex-col pt-6 px-6 transition-all duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <span className="font-black text-2xl tracking-[0.2em] text-[#111111] uppercase select-none">
                            iLOOK
                        </span>
                        <button onClick={() => setIsMenuOpen(false)} className="text-[#111111] hover:opacity-75 transition-opacity">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col divide-y divide-[#E0E0E0]/80">
                        <Link href={route('storefront.home')} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Wanita</Link>
                        <Link href={route('storefront.home', { category: 'pakaian-pria' })} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Pria</Link>
                        <Link href={route('storefront.home', { category: 'dress' })} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Dress</Link>
                        <Link href={route('storefront.home')} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#c22e2e] hover:pl-2 transition-all duration-200">Promo</Link>
                        <form onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }} className="py-4 flex items-center gap-3">
                            <Search className="w-4 h-4 text-[#5d5f5f] flex-shrink-0" />
                            <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 text-sm bg-transparent border-none focus:ring-0 text-[#0a0a0a] placeholder-[#888888] py-2" />
                        </form>
                    </nav>
                </div>
            )}

            {/* Flash Alerts */}
            {flash?.success && (
                <div className="bg-[#0a0a0a] text-white px-10 py-3 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-[0.05em]">{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="bg-[#530A0C] text-white px-10 py-3 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-[0.05em]">{flash.error}</span>
                </div>
            )}


            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-[#E0E0E0] pt-12 md:pt-20 pb-10 px-4 sm:px-6 md:px-10 w-full">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-20">
                    {/* Brand */}
                    <div className="space-y-8">
                        <span className="font-black text-xl tracking-[0.25em] text-[#0a0a0a] uppercase block">iLOOK</span>
                        <div>
                            <h6 className="text-[11px] font-bold tracking-[0.05em] uppercase mb-4 text-[#0a0a0a]">DOWNLOAD APLIKASI</h6>
                            <div className="flex gap-4">
                                <div className="w-28 h-9 bg-[#0a0a0a] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                                    <span className="text-white text-[10px] font-bold tracking-wider">APP STORE</span>
                                </div>
                                <div className="w-28 h-9 bg-[#0a0a0a] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                                    <span className="text-white text-[10px] font-bold tracking-wider">PLAY STORE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Social */}
                    <div>
                        <h6 className="text-[11px] font-bold tracking-[0.05em] uppercase mb-6 text-[#0a0a0a]">TEMUKAN KAMI</h6>
                        <ul className="space-y-4 text-sm text-[#5d5f5f]">
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Instagram</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Facebook</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">TikTok</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Youtube</li>
                        </ul>
                    </div>
                    {/* Info */}
                    <div>
                        <h6 className="text-[11px] font-bold tracking-[0.05em] uppercase mb-6 text-[#0a0a0a]">INFORMASI KAMI</h6>
                        <ul className="space-y-4 text-sm text-[#5d5f5f]">
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Tentang iLook Fashion</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Kontak</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Kebijakan Privasi</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Ketentuan Layanan</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Lokasi Toko</li>
                        </ul>
                    </div>
                    {/* Help */}
                    <div>
                        <h6 className="text-[11px] font-bold tracking-[0.05em] uppercase mb-6 text-[#0a0a0a]">PUSAT BANTUAN</h6>
                        <ul className="space-y-4 text-sm text-[#5d5f5f] mb-8">
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">FAQ</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Kebijakan Pengiriman</li>
                            <li className="hover:text-[#0a0a0a] transition-colors cursor-pointer">Click &amp; Collect</li>
                        </ul>
                        <h6 className="text-[11px] font-bold tracking-[0.05em] uppercase mb-4 text-[#0a0a0a]">LACAK PESANAN</h6>
                        <div className="relative">
                            <input
                                className="w-full border-b border-[#747878] bg-transparent py-2 px-0 focus:outline-none focus:border-[#0a0a0a] text-[10px] font-bold tracking-[0.05em] uppercase placeholder-[#747878]"
                                placeholder="NOMOR ORDER"
                                type="text"
                            />
                        </div>
                    </div>
                </div>
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#E0E0E0] gap-4">
                    <p className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#5d5f5f] text-center md:text-left">© {new Date().getFullYear()} ILOOK FASHION. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-6 text-[10px] font-bold tracking-[0.05em] uppercase text-[#5d5f5f]">
                        <span>IDR - INDONESIA</span>
                        <span>OMS: GINEE</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
