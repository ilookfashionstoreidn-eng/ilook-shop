import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, User, LogOut, Lock, Menu, X, Heart, MessageSquare, Send, Minus } from 'lucide-react';
import axios from 'axios';

export default function StorefrontLayout({ children }) {
    const { auth, flash = {}, flashSale } = usePage().props;
    const isHomePage = route().current('storefront.home');
    const [cartCount, setCartCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

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
                    className={`fixed bottom-6 right-6 z-[90] bg-white border border-[#eeeeee] shadow-2xl flex flex-col font-sans transition-all duration-300 ${
                        isChatMinimized 
                            ? 'w-[280px] h-[60px] cursor-pointer overflow-hidden' 
                            : 'w-[360px] h-[480px] animate-slide-up'
                    }`}
                >
                    {/* Header */}
                    <div className="bg-[#111111] text-white p-4 flex items-center justify-between h-[60px] flex-shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs uppercase text-white flex-shrink-0">
                                    CS
                                </div>
                                {isChatMinimized && chatUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
                                        {chatUnreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">CS iLOOK Fashion</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsChatMinimized(!isChatMinimized);
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
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
                                className="p-1 text-gray-400 hover:text-white transition-colors"
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
                                <div className="p-3 bg-[#fcfcfc] border-b border-[#eeeeee] flex items-center justify-between gap-3 relative">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <img
                                            src={chatProductContext.images && chatProductContext.images[0] ? chatProductContext.images[0] : FALLBACK_IMG}
                                            alt={chatProductContext.name}
                                            className="w-10 h-10 object-cover border border-[#eeeeee] flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-[#888888] uppercase tracking-wider">Bertanya tentang:</p>
                                            <h5 className="text-[11px] font-bold text-[#111111] truncate">{chatProductContext.name}</h5>
                                            <p className="text-[10px] font-bold text-black">{formatCurrency(chatProductContext.base_price)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setChatProductContext(null);
                                        }}
                                        className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-gray-600"
                                        title="Hapus konteks"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {/* Messages Body */}
                            <div id="chat-body" className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcfcfc] flex flex-col">
                                {chatMessages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                        <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                                        <p className="text-[11px] text-[#666666]">Mulai obrolan dengan Customer Service kami.</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Ketik pesan di bawah dan kirim.</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg) => {
                                        const isMe = msg.sender_id === auth.user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                                                        isMe
                                                            ? 'bg-black text-white rounded-tr-none'
                                                            : 'bg-[#eeeeee] text-[#111111] rounded-tl-none'
                                                    }`}
                                                >
                                                    {msg.message}
                                                </div>
                                                <span className="text-[8px] text-gray-400 mt-1 uppercase tracking-wider">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Templates Toggle Bar */}
                            <div className="px-3 py-1.5 bg-gray-50 flex items-center justify-between border-t border-[#eeeeee] flex-shrink-0">
                                <span className="text-[9px] font-bold text-[#888888] uppercase tracking-wider">Tanya Cepat</span>
                                <button
                                    type="button"
                                    onClick={() => setShowChatTemplates(!showChatTemplates)}
                                    className="text-[9px] font-bold text-black uppercase hover:underline"
                                >
                                    {showChatTemplates ? "Sembunyikan" : "Tampilkan"}
                                </button>
                            </div>

                            {/* Templates Area */}
                            {showChatTemplates && (
                                <div className="px-3 pb-2 bg-white flex flex-col gap-1 flex-shrink-0">
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
                                            className="w-full text-left px-3 py-1.5 bg-[#f5f5f5] hover:bg-black hover:text-white transition-all duration-200 text-[9px] font-bold uppercase tracking-wider block truncate"
                                        >
                                            {template}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input Area */}
                            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[#eeeeee] bg-white flex gap-2">
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
                                    className="flex-1 px-3 py-2 border border-[#eeeeee] text-xs focus:outline-none focus:border-black placeholder:text-gray-400 rounded-none bg-white text-black"
                                />
                                <button
                                    type="submit"
                                    className="bg-black hover:bg-black/90 text-white p-2 text-xs flex items-center justify-center transition-colors rounded-none"
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
                    className="fixed bottom-6 right-6 z-[80] w-12 h-12 bg-black text-white shadow-2xl flex items-center justify-center border border-black hover:bg-white hover:text-black transition-all duration-300 rounded-full"
                    title="Buka Chat CS"
                >
                    <MessageSquare className="w-5 h-5" />
                    {chatUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                            {chatUnreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}
