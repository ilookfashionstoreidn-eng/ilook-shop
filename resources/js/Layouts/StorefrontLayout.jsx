import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, User, LogOut, Lock, Menu, X, Heart, MessageSquare, Send, Minus, ChevronRight } from 'lucide-react';
import axios from 'axios';

export default function StorefrontLayout({ children }) {
    const { auth, flash = {}, flashSale, navCategories = [] } = usePage().props;
    const isHomePage = route().current('storefront.home');
    const [cartCount, setCartCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Dynamic Promo Slider
    const promos = [
        "GRATIS ONGKIR DENGAN MINIMAL BELANJA RP 500.000",
        "DAPATKAN DISKON 10% UNTUK MEMBER BARU DENGAN KODE: ILOOKNEW",
        "LAYANAN CLICK & COLLECT - BELANJA ONLINE & AMBIL DI TOKO",
        "PENGIRIMAN EKSPRES - ESTIMASI 1-2 HARI SAMPAI"
    ];
    const [promoIdx, setPromoIdx] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setPromoIdx(prev => (prev + 1) % promos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Global Chat Widget States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChatAuthModal, setShowChatAuthModal] = useState(false);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const [showChatTemplates, setShowChatTemplates] = useState(true);
    const [chatProductContext, setChatProductContext] = useState(null);

    const chatTemplates = [
        "Apakah produk ini ready?",
        "Berapa lama estimasi pengiriman?",
        "Apakah ada promo aktif?",
        "Bisa kirim hari ini?",
    ];

    const FALLBACK_IMG = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60';

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    // Fetch chat messages
    const fetchChatMessages = (isFirstLoad = false) => {
        if (!auth?.user) return;
        axios.get('/api/chats/messages')
            .then(res => {
                if (res.data.success) {
                    setChatMessages(res.data.messages);
                    
                    // Count unread
                    const unread = res.data.messages.filter(m => m.sender_id !== auth.user.id && !m.is_read).length;
                    setChatUnreadCount(unread);

                    if (isChatOpen && unread > 0) {
                        markChatAsRead();
                    }
                }
            })
            .catch(err => console.error('Error fetching messages:', err));
    };

    // Mark as read
    const markChatAsRead = () => {
        if (!auth?.user) return;
        axios.post('/api/chats/read')
            .then(() => {
                setChatUnreadCount(0);
            })
            .catch(err => console.error('Error marking as read:', err));
    };

    // Send chat message
    const handleSendChatMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !auth?.user) return;

        const payload = {
            message: newMessage,
            product_id: chatProductContext?.id || null
        };

        axios.post('/api/chats/messages', payload)
            .then(res => {
                if (res.data.success) {
                    setChatMessages(prev => [...prev, res.data.message]);
                    setNewMessage('');
                    // Scroll to bottom
                    setTimeout(() => {
                        const chatBody = document.getElementById('chat-body');
                        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
                    }, 50);
                }
            })
            .catch(err => console.error('Error sending message:', err));
    };

    // Polling effect
    useEffect(() => {
        if (auth?.user) {
            // Initial load
            fetchChatMessages(true);

            // Set up polling interval
            const interval = setInterval(() => {
                fetchChatMessages();
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [auth?.user, isChatOpen]);

    // Scroll to bottom when opening chat or maximizing
    useEffect(() => {
        if (isChatOpen && !isChatMinimized) {
            markChatAsRead();
            setTimeout(() => {
                const chatBody = document.getElementById('chat-body');
                if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
            }, 100);
        }
    }, [isChatOpen, isChatMinimized]);

    // Listen to custom event to open chat from detail page
    useEffect(() => {
        const handleOpenChat = (e) => {
            if (auth?.user) {
                setIsChatOpen(true);
                setIsChatMinimized(false);
                if (e.detail?.product) {
                    setChatProductContext(e.detail.product);
                }
            } else {
                setShowChatAuthModal(true);
            }
        };
        window.addEventListener('open-system-chat', handleOpenChat);
        return () => window.removeEventListener('open-system-chat', handleOpenChat);
    }, [auth?.user]);

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
        if (e) e.preventDefault();
        if (!searchQuery || !searchQuery.trim()) return;
        const q = searchQuery.trim();
        setShowSearch(false);
        router.get(route('storefront.products'), { search: q });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };
    return (
        <div className="min-h-screen bg-white text-[#111111] flex flex-col" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>

            {/* Top Promo Bar */}
            <div className="bg-[#111111] text-white text-[9px] font-bold tracking-[0.2em] uppercase h-9 flex items-center justify-center px-4 w-full select-none sticky top-0 z-50 overflow-hidden">
                <div className="transition-all duration-500 ease-in-out transform">
                    {promos[promoIdx]}
                </div>
            </div>

            {/* Navbar — Logo on left, nav in center, actions on right */}
            <header className="bg-white/85 backdrop-blur-md flex justify-between items-center w-full px-4 sm:px-6 md:px-10 h-20 sticky top-9 z-40 border-b border-gray-100 transition-all duration-300">
                {/* Left: Brand Logo + Mobile Hamburger */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-[#111111] hover:opacity-75 transition-opacity md:hidden cursor-pointer bg-transparent border-none"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link href={route('storefront.home')} className="flex items-center group">
                        <span className="font-extrabold text-2xl tracking-[0.25em] text-[#111111] uppercase select-none relative">
                            iLOOK<span className="text-red-600">.</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black group-hover:w-full transition-all duration-300"></span>
                        </span>
                    </Link>
                </div>

                {/* Center: Main Navigation Menu (Desktop Only) */}
                <nav className="hidden md:flex gap-8 items-center justify-center flex-1">
                    <Link
                        href={route('storefront.home')}
                        className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 relative py-1.5 group ${
                            isHomePage && !route().params?.category
                                ? 'text-black'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        HOME
                        <span className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${
                            isHomePage && !route().params?.category ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </Link>
                    <Link
                        href={route('storefront.home', { category: 'pakaian-wanita' })}
                        className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 relative py-1.5 group ${
                            route().params?.category === 'pakaian-wanita'
                                ? 'text-black'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        WANITA
                        <span className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${
                            route().params?.category === 'pakaian-wanita' ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </Link>
                    <Link
                        href={route('storefront.home', { category: 'pakaian-pria' })}
                        className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 relative py-1.5 group ${
                            route().params?.category === 'pakaian-pria'
                                ? 'text-black'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        PRIA
                        <span className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${
                            route().params?.category === 'pakaian-pria' ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </Link>
                    <Link
                        href={route('storefront.home', { category: 'pakaian-anak' })}
                        className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 relative py-1.5 group ${
                            route().params?.category === 'pakaian-anak'
                                ? 'text-black'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        ANAK
                        <span className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${
                            route().params?.category === 'pakaian-anak' ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </Link>
                    <Link
                        href={route('storefront.home', { category: 'family-set' })}
                        className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 relative py-1.5 group ${
                            route().params?.category === 'family-set'
                                ? 'text-black'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        FAMILY
                        <span className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${
                            route().params?.category === 'family-set' ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </Link>
                    <Link
                        href={route('storefront.promo')}
                        className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-red-600 hover:text-red-500 transition-colors relative py-1.5 group"
                    >
                        PROMO
                        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="text-[#111111] hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none"
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
                                    className="text-[#111111] hover:opacity-75 transition-opacity flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
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
                                        <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl z-40 py-2 divide-y divide-gray-100 animate-slide-up">
                                            <div className="px-4 py-3 pb-2.5">
                                                <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-gray-400">Selamat datang,</p>
                                                <p className="text-sm font-extrabold text-[#111111] truncate mt-0.5">{auth.user.name}</p>
                                            </div>
                                            <div className="py-1">
                                                {auth.user.role === 'admin' && (
                                                    <Link href={route('admin.dashboard')} className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-gray-50 text-[#111111] transition-colors">
                                                        <Lock className="w-4 h-4 text-gray-500" />
                                                        <span>Admin Panel</span>
                                                    </Link>
                                                )}
                                                <Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-gray-50 text-[#111111] transition-colors">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span>Profil Saya</span>
                                                </Link>
                                                <Link href={route('storefront.my-orders')} className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-gray-50 text-[#111111] transition-colors">
                                                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                                                    <span>Pesanan Saya</span>
                                                </Link>
                                            </div>
                                            <div className="py-1">
                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-red-600 hover:bg-red-50/50 transition-colors text-left cursor-pointer bg-transparent border-none">
                                                    <LogOut className="w-4 h-4 text-red-600" />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href={route('login')} className="text-[#111111] hover:opacity-75 transition-opacity" title="Masuk">
                                <User className="w-5 h-5" />
                            </Link>
                        )}

                        {/* Wishlist placeholder */}
                        <button className="text-[#111111] hover:opacity-75 transition-opacity hidden sm:block cursor-pointer bg-transparent border-none">
                            <Heart className="w-5 h-5" />
                        </button>

                        {/* Cart */}
                        <Link
                            href={route('storefront.cart')}
                            className="text-[#111111] hover:opacity-75 transition-opacity relative"
                            title="Keranjang"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-extrabold border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Secondary category nav — sits directly under the header. Only the
                top-level categories (Pakaian Wanita, Pakaian Pria, Pakaian Anak);
                subcategories are picked from a pill row on the /products page
                itself instead of a hover dropdown here (which got clipped by
                this row's own overflow-x-auto — vertical overflow computes to
                'auto' too once horizontal is non-visible, per the CSS spec). */}
            {navCategories.length > 0 && (
                <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 md:px-10 h-10 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-[116px] z-30 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => router.get(route('storefront.products'))}
                        className={`text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-colors cursor-pointer bg-transparent border-none ${
                            route().current('storefront.products') && !route().params?.category
                                ? 'text-black'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        Semua
                    </button>
                    {navCategories.map(cat => {
                        const isActive = route().params?.category === cat.slug
                            || cat.children?.some(c => c.slug === route().params?.category);

                        return (
                            <button
                                key={cat.id}
                                onClick={() => router.get(route('storefront.products'), { category: cat.slug })}
                                className={`text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-colors cursor-pointer bg-transparent border-none flex-shrink-0 ${
                                    isActive ? 'text-black' : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Search Overlay */}
            {showSearch && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 transition-all duration-300">
                    <div className="bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-slide-up">
                        <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-gray-100 p-2">
                            <button type="submit" className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer bg-transparent border-none">
                                <Search className="w-5 h-5 flex-shrink-0" />
                            </button>
                            <input
                                type="text"
                                placeholder="Cari produk, dress, kemeja..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                                className="flex-1 py-4 text-sm bg-transparent border-none focus:ring-0 text-[#0a0a0a] placeholder-gray-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors mr-2 cursor-pointer border-none"
                            >
                                Cari
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSearch(false)}
                                className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer bg-transparent border-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </form>
                        
                        {/* Trending & Suggestions */}
                        <div className="p-6 bg-gray-50/50">
                            <h5 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400 mb-3">Trending Searches</h5>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {['Blouse', 'Linen Dress', 'Knitwear', 'Oversized Pants', 'Kemeja Pria'].map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery(term);
                                            router.get(route('storefront.products'), { search: term });
                                            setShowSearch(false);
                                        }}
                                        className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>

                            <h5 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400 mb-3">Kategori Terpopuler</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { name: 'Kasual & Santai', slug: '' },
                                    { name: 'Koleksi Dress', slug: 'dress' },
                                    { name: 'Pakaian Pria', slug: 'pakaian-pria' }
                                ].map((cat) => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => {
                                            router.get(route('storefront.products'), cat.slug ? { category: cat.slug } : {});
                                            setShowSearch(false);
                                        }}
                                        className="p-3 bg-white border border-gray-200 hover:border-black rounded-lg text-left text-xs font-bold uppercase tracking-wider text-[#111111] transition-all duration-200 cursor-pointer flex items-center justify-between"
                                    >
                                        <span>{cat.name}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-white flex flex-col pt-6 px-6 transition-all duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <span className="font-black text-2xl tracking-[0.2em] text-[#111111] uppercase select-none">
                            iLOOK<span className="text-red-600">.</span>
                        </span>
                        <button onClick={() => setIsMenuOpen(false)} className="text-[#111111] hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col divide-y divide-gray-100">
                        <Link href={route('storefront.home')} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Home</Link>
                        <Link href={route('storefront.home', { category: 'pakaian-wanita' })} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Wanita</Link>
                        <Link href={route('storefront.home', { category: 'pakaian-pria' })} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Pria</Link>
                        <Link href={route('storefront.home', { category: 'pakaian-anak' })} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Anak</Link>
                        <Link href={route('storefront.home', { category: 'family-set' })} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#111111] hover:pl-2 transition-all duration-200">Family</Link>
                        <Link href={route('storefront.promo')} onClick={() => setIsMenuOpen(false)} className="py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#c22e2e] hover:pl-2 transition-all duration-200">Promo</Link>
                        <form onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }} className="py-4 flex items-center gap-3">
                            <Search className="w-4 h-4 text-[#5d5f5f] flex-shrink-0" />
                            <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 text-sm bg-transparent border-none focus:ring-0 text-[#0a0a0a] placeholder-[#888888] py-2 focus:outline-none" />
                        </form>
                    </nav>
                </div>
            )}

            {/* Flash Alerts */}
            {flash?.success && (
                <div className="bg-[#111111] text-white px-10 py-3 text-center border-t border-white/10 shadow-lg animate-fade-in z-30">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-700 text-white px-10 py-3 text-center border-t border-white/10 shadow-lg animate-fade-in z-30">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{flash.error}</span>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 pt-16 md:pt-24 pb-12 px-4 sm:px-6 md:px-10 w-full">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16 md:mb-24">
                    {/* Brand */}
                    <div className="space-y-6">
                        <span className="font-extrabold text-2xl tracking-[0.25em] text-[#111111] uppercase block">
                            iLOOK<span className="text-red-600">.</span>
                        </span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Membawa tren fashion modern klasik terdepan untuk gaya elegan Anda yang tak lekang oleh waktu.
                        </p>
                        <div className="pt-2">
                            <h6 className="text-[10px] font-extrabold tracking-[0.15em] uppercase mb-4 text-[#111111]">DOWNLOAD APLIKASI</h6>
                            <div className="flex gap-3">
                                <div className="px-4 py-2 bg-[#111111] text-white text-[9px] font-bold tracking-wider hover:bg-gray-800 transition-colors cursor-pointer rounded-sm flex items-center justify-center">
                                    APP STORE
                                </div>
                                <div className="px-4 py-2 bg-[#111111] text-white text-[9px] font-bold tracking-wider hover:bg-gray-800 transition-colors cursor-pointer rounded-sm flex items-center justify-center">
                                    PLAY STORE
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Social */}
                    <div>
                        <h6 className="text-[10px] font-extrabold tracking-[0.15em] uppercase mb-6 text-[#111111]">TEMUKAN KAMI</h6>
                        <ul className="space-y-3.5 text-xs text-gray-500">
                            <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Facebook</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">TikTok</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">YouTube Channel</a></li>
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h6 className="text-[10px] font-extrabold tracking-[0.15em] uppercase mb-6 text-[#111111]">INFORMASI KAMI</h6>
                        <ul className="space-y-3.5 text-xs text-gray-500">
                            <li><a href="#" className="hover:text-black transition-colors">Tentang iLook Fashion</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Kontak Layanan</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Kebijakan Privasi</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Ketentuan Layanan</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Lokasi Butik & Store</a></li>
                        </ul>
                    </div>

                    {/* Help & Lacak Pesanan */}
                    <div>
                        <h6 className="text-[10px] font-extrabold tracking-[0.15em] uppercase mb-6 text-[#111111]">PUSAT BANTUAN</h6>
                        <ul className="space-y-3.5 text-xs text-gray-500 mb-8">
                            <li><a href="#" className="hover:text-black transition-colors">FAQ & Bantuan</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Kebijakan Pengiriman & Retur</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Layanan Click & Collect</a></li>
                        </ul>
                        <h6 className="text-[10px] font-extrabold tracking-[0.15em] uppercase mb-4 text-[#111111]">LACAK PESANAN</h6>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const val = e.target.elements.orderNum.value.trim();
                            if (val) {
                                router.get(route('storefront.home'), { search: val });
                            }
                        }} className="relative flex items-center">
                            <input
                                name="orderNum"
                                className="w-full border-b border-gray-300 bg-transparent py-2 px-0 text-xs font-semibold tracking-wider placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                                placeholder="NOMOR ORDER ANDA"
                                type="text"
                                required
                            />
                            <button type="submit" className="absolute right-0 bottom-2 text-gray-500 hover:text-black transition-colors bg-transparent border-none cursor-pointer">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400 text-center md:text-left">© {new Date().getFullYear()} ILOOK FASHION. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-6 text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400">
                        <span>IDR - INDONESIA</span>
                        <span>OMS: GINEE</span>
                    </div>
                </div>
            </footer>
            <style>{`
                @keyframes chatSlideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes chatFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up {
                    animation: chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in {
                    animation: chatFadeIn 0.2s ease-out forwards;
                }
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Chat Auth Modal */}
            {showChatAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white max-w-sm w-full p-6 text-center shadow-xl border border-gray-100 font-sans">
                        <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-full mx-auto mb-4 text-[#111111]">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111] mb-2">Login Diperlukan</h3>
                        <p className="text-xs text-[#666666] leading-relaxed mb-6">
                            Silakan masuk atau daftar terlebih dahulu untuk menggunakan fitur chat di sistem.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link
                                href={route('login')}
                                className="w-full py-2.5 bg-black hover:bg-black/90 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center"
                            >
                                Masuk Sekarang
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowChatAuthModal(false)}
                                className="w-full py-2.5 bg-white border border-[#eeeeee] hover:bg-[#fcfcfc] text-[#666666] text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chat Widget */}
            {auth?.user && isChatOpen && (
                <div 
                    onClick={() => {
                        if (isChatMinimized) {
                            setIsChatMinimized(false);
                        }
                    }}
                    className={`fixed bottom-6 right-6 z-[90] bg-white border border-gray-100 shadow-3xl flex flex-col font-sans transition-all duration-300 rounded-2xl overflow-hidden ${
                        isChatMinimized 
                            ? 'w-[280px] h-[65px] cursor-pointer' 
                            : 'w-[370px] h-[500px] animate-slide-up'
                    }`}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 flex items-center justify-between h-[65px] flex-shrink-0 select-none">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-extrabold text-xs uppercase text-white flex-shrink-0 border border-white/5">
                                    CS
                                </div>
                                {isChatMinimized && chatUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-md animate-pulse">
                                        {chatUnreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white truncate">CS iLOOK Fashion</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                                    <span className="text-[9px] text-gray-300 font-semibold uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsChatMinimized(!isChatMinimized);
                                }}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                                title={isChatMinimized ? "Perbesar" : "Perkecil"}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsChatOpen(false);
                                    setIsChatMinimized(false);
                                }}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                                title="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!isChatMinimized && (
                        <>
                            {/* Product Sticky Context Bar inside Chat */}
                            {chatProductContext && (
                                <div className="p-3.5 bg-gray-55/80 backdrop-blur-xs border-b border-gray-100 flex items-center justify-between gap-3 relative animate-slide-up">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={chatProductContext.images && chatProductContext.images[0] ? chatProductContext.images[0] : FALLBACK_IMG}
                                            alt={chatProductContext.name}
                                            className="w-11 h-11 object-cover border border-gray-100 rounded-lg flex-shrink-0 shadow-sm"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">Bertanya tentang:</p>
                                            <h5 className="text-xs font-bold text-gray-800 truncate mt-0.5">{chatProductContext.name}</h5>
                                            <p className="text-[11px] font-black text-black mt-0.5">{formatCurrency(chatProductContext.base_price)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setChatProductContext(null);
                                        }}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors bg-transparent border-none cursor-pointer"
                                        title="Hapus konteks"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* Messages Body */}
                            <div id="chat-body" className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 flex flex-col">
                                {chatMessages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md mb-3 text-gray-300">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-700">Mulai Obrolan CS</p>
                                        <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto mt-1 leading-relaxed">Hubungi admin untuk detail ketersediaan produk, ukuran, atau pengiriman.</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg) => {
                                        const isMe = msg.sender_id === auth.user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                                                        isMe
                                                            ? 'bg-black text-white rounded-tr-none'
                                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                    }`}
                                                >
                                                    {msg.message}
                                                </div>
                                                <span className="text-[8px] text-gray-400 mt-1.5 uppercase font-bold tracking-wider px-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Templates Toggle Bar */}
                            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between border-t border-gray-100 flex-shrink-0 select-none">
                                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Tanya Cepat</span>
                                <button
                                    type="button"
                                    onClick={() => setShowChatTemplates(!showChatTemplates)}
                                    className="text-[9px] font-extrabold text-black uppercase tracking-wider hover:underline cursor-pointer bg-transparent border-none"
                                >
                                    {showChatTemplates ? "Sembunyikan" : "Tampilkan"}
                                </button>
                            </div>

                            {/* Templates Area */}
                            {showChatTemplates && (
                                <div className="px-4 pb-3 bg-white flex flex-wrap gap-1.5 flex-shrink-0 pt-1">
                                    {chatTemplates.map((template, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                const payload = {
                                                    message: template,
                                                    product_id: chatProductContext?.id || null
                                                };
                                                axios.post('/api/chats/messages', payload)
                                                    .then(res => {
                                                        if (res.data.success) {
                                                            setChatMessages(prev => [...prev, res.data.message]);
                                                            setShowChatTemplates(false); // Auto-hide templates on send
                                                            // Scroll to bottom
                                                            setTimeout(() => {
                                                                const chatBody = document.getElementById('chat-body');
                                                                if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
                                                            }, 50);
                                                        }
                                                    })
                                                    .catch(err => console.error('Error sending template message:', err));
                                            }}
                                            className="px-3 py-1.5 bg-gray-50 hover:bg-black hover:text-white rounded-full text-[10px] font-semibold text-gray-600 transition-all duration-200 border border-gray-200/50 cursor-pointer max-w-[280px] truncate"
                                        >
                                            {template}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input Area */}
                            <form onSubmit={handleSendChatMessage} className="p-3.5 border-t border-gray-100 bg-white flex gap-2 flex-shrink-0">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSendChatMessage(e);
                                        }
                                    }}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-xs focus:outline-none focus:border-black placeholder:text-gray-400 rounded-full bg-white text-[#111111] focus:ring-0"
                                />
                                <button
                                    type="submit"
                                    className="bg-black hover:bg-gray-800 text-white p-2.5 text-xs flex items-center justify-center transition-all rounded-full cursor-pointer w-9 h-9 shadow-md flex-shrink-0"
                                    title="Kirim"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* Floating Chat Trigger Button (only visible if chat window is closed and user is logged in) */}
            {auth?.user && !isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 z-[80] w-12 h-12 bg-black text-white shadow-3xl flex items-center justify-center border border-black hover:bg-white hover:text-black transition-all duration-300 rounded-full cursor-pointer"
                    title="Buka Chat CS"
                >
                    <MessageSquare className="w-5 h-5" />
                    {chatUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-md animate-pulse">
                            {chatUnreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}
