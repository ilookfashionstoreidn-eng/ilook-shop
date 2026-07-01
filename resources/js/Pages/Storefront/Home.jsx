import React, { useState, useEffect } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Zap, Truck, RefreshCw, Store, ChevronRight, ChevronLeft, Play, ExternalLink } from 'lucide-react';

function FlashSaleBanner({ flashSale }) {
    const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
    const [statusText, setStatusText] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const carouselRef = React.useRef(null);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(val);
    };

    useEffect(() => {
        if (!flashSale.start_time && !flashSale.end_time) {
            setIsVisible(true);
            setIsLive(true);
            setStatusText('Sedang Berlangsung');
            return;
        }

        const checkTime = () => {
            const now = new Date();
            const start = flashSale.start_time ? new Date(flashSale.start_time) : null;
            const end = flashSale.end_time ? new Date(flashSale.end_time) : null;

            let target = null;
            if (start && now < start) {
                target = start;
                setStatusText('Dimulai dalam');
                setIsLive(false);
                setIsVisible(true);
            } else if (end && now <= end) {
                target = end;
                setStatusText('Berakhir dalam');
                setIsLive(true);
                setIsVisible(true);
            } else if (end && now > end) {
                setIsVisible(false);
                return false;
            } else {
                setIsLive(true);
                setIsVisible(true);
                setStatusText('Sedang Berlangsung');
                return false;
            }

            if (target) {
                const diffMs = target - now;
                const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
                const h = Math.floor(diffSecs / 3600);
                const m = Math.floor((diffSecs % 3600) / 60);
                const s = diffSecs % 60;

                setTimeLeft({
                    h: String(h).padStart(2, '0'),
                    m: String(m).padStart(2, '0'),
                    s: String(s).padStart(2, '0'),
                });
            }
            return true;
        };

        checkTime();
        const interval = setInterval(() => {
            const keepRunning = checkTime();
            if (!keepRunning) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [flashSale]);

    const scroll = (direction) => {
        if (carouselRef.current) {
            const { scrollLeft, clientWidth } = carouselRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth * 0.8
                : scrollLeft + clientWidth * 0.8;
            carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!isVisible || flashSale.products.length === 0) return null;

    return (
        <section className="bg-gradient-to-r from-[#0d1430] via-[#121c44] to-[#0d1430] text-white py-12 px-4 md:py-16 md:px-10 border-b border-[#1e293b] relative overflow-hidden select-none w-full my-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-10">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-extrabold text-3xl sm:text-5xl tracking-[0.15em] text-white flex items-center gap-1.5 uppercase drop-shadow-md">
                            F<span className="text-yellow-400 animate-pulse text-2xl sm:text-4xl">⚡</span>ash Sale
                        </span>
                    </div>

                    {(flashSale.start_time || flashSale.end_time) && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/30 backdrop-blur-md px-6 py-3.5 border border-white/10 rounded-xl mt-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#eeeeee]">{statusText}</span>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center min-w-[36px]">
                                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">{timeLeft.h}</span>
                                    <span className="text-[8px] font-bold tracking-widest text-white/50 uppercase mt-0.5">Jam</span>
                                </div>
                                <span className="text-lg font-bold text-white/60 -mt-2.5">:</span>
                                <div className="flex flex-col items-center min-w-[36px]">
                                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">{timeLeft.m}</span>
                                    <span className="text-[8px] font-bold tracking-widest text-white/50 uppercase mt-0.5">Menit</span>
                                </div>
                                <span className="text-lg font-bold text-white/60 -mt-2.5">:</span>
                                <div className="flex flex-col items-center min-w-[36px]">
                                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">{timeLeft.s}</span>
                                    <span className="text-[8px] font-bold tracking-widest text-white/50 uppercase mt-0.5">Detik</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative w-full group">
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto scroll-smooth gap-4 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {flashSale.products.map((item) => {
                            const mainImage = item.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60';
                            
                            return (
                                <div key={item.id} className="min-w-[190px] w-[190px] sm:min-w-[240px] sm:w-[240px] snap-start bg-white text-black rounded-none overflow-hidden border-none shadow-sm flex flex-col group/card hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                                        <img
                                            src={mainImage}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                        />

                                        <span className="absolute top-0 left-0 bg-[#c22e2e] text-white text-[10px] font-bold px-2 py-0.75 uppercase tracking-wider rounded-none shadow-sm select-none">
                                            {item.discount_type === 'percentage' 
                                                ? `-${Math.round(item.discount_value)}%` 
                                                : `-${formatCurrency(item.discount_value)}`}
                                        </span>

                                        <Link
                                            href={route('storefront.product', item.slug)}
                                            className="absolute bottom-0 left-0 right-0 bg-black/95 text-white py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-center transform translate-y-full group-hover/card:translate-y-0 transition-transform duration-300"
                                        >
                                            BELI SEKARANG
                                        </Link>
                                    </div>

                                    <div className="p-4 flex-grow flex flex-col justify-between gap-1 bg-white">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-black truncate leading-none">
                                                {item.category_name}
                                            </p>
                                            <Link href={route('storefront.product', item.slug)}>
                                                <h3 className="text-xs sm:text-[13px] font-normal text-[#333333] hover:text-black transition-colors line-clamp-1 mt-1">
                                                    {item.name}
                                                </h3>
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1 mt-1">
                                            <span className="text-[11px] text-gray-400 line-through">
                                                {formatCurrency(item.base_price)}
                                            </span>
                                            <span className="text-xs sm:text-[13px] font-bold text-[#c22e2e]">
                                                {formatCurrency(item.flash_sale_price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ActiveLivestreamSection({ streams }) {
    if (!streams || streams.length === 0) return null;

    const [selectedIdx, setSelectedIdx] = useState(0);
    const stream = streams[selectedIdx] || streams[0];

    const isTikTokLive = stream.tiktok_url.toLowerCase().includes('tiktok.com') && stream.tiktok_url.toLowerCase().includes('/live');
    const isYoutubeLive = stream.tiktok_url.toLowerCase().includes('youtube.com') || stream.tiktok_url.toLowerCase().includes('youtu.be');
    const isTwitchLive = stream.tiktok_url.toLowerCase().includes('twitch.tv');
    const isAnyLive = isTikTokLive || (isYoutubeLive && stream.tiktok_url.toLowerCase().includes('live')) || isTwitchLive;

    // Parse username/handle from TikTok URL (e.g. https://www.tiktok.com/@username/live -> @username)
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
        <section className="bg-gradient-to-br from-[#0b0c10] via-[#1f2833] to-[#0b0c10] text-white py-12 px-4 md:py-16 md:px-10 w-full relative overflow-hidden border-b border-[#1e293b] select-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl -ml-60 -mt-60 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -mr-60 -mb-60 pointer-events-none" />

            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
                
                {/* Content details (Left) */}
                <div className="flex flex-col gap-6 text-left order-2 md:order-1">
                    <div className="flex items-center gap-3">
                        {isAnyLive ? (
                            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm flex items-center gap-1.5 uppercase tracking-widest animate-pulse shadow-lg shadow-red-500/20">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping mr-1" />
                                LIVE STREAMING
                            </span>
                        ) : (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-sm flex items-center gap-1.5 uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                <Play className="w-3.5 h-3.5 text-white" />
                                VIDEO TERBARU
                            </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">iLOOK TIKTOK CHANNEL</span>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl sm:text-3xl md:text-[40px] font-black uppercase tracking-tight leading-none text-white drop-shadow-sm font-outfit line-clamp-2">
                            {stream.title}
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-emerald-500" />
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg">
                        Tonton keseruan review koleksi fashion eksklusif kami secara langsung di TikTok! Dapatkan penawaran flash sale, diskon khusus, dan hadiah kejutan menarik selama acara berlangsung.
                    </p>

                    {/* Channel Selector Tabs (If more than 1 active live stream) */}
                    {streams.length > 1 && (
                        <div className="space-y-2 mt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pilih Saluran Aktif:</span>
                            <div className="flex flex-wrap gap-2 max-w-lg">
                                {streams.map((item, idx) => {
                                    const activeIsTikTokLive = item.tiktok_url.toLowerCase().includes('tiktok.com') && item.tiktok_url.toLowerCase().includes('/live');
                                    const activeIsYoutubeLive = item.tiktok_url.toLowerCase().includes('youtube.com') || item.tiktok_url.toLowerCase().includes('youtu.be');
                                    const activeIsTwitchLive = item.tiktok_url.toLowerCase().includes('twitch.tv');
                                    const activeIsAnyLive = activeIsTikTokLive || (activeIsYoutubeLive && item.tiktok_url.toLowerCase().includes('live')) || activeIsTwitchLive;
                                    const isSelected = idx === selectedIdx;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedIdx(idx)}
                                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-white text-black border-white shadow-lg'
                                                    : 'bg-black/30 text-gray-300 border-white/10 hover:bg-black/50 hover:text-white'
                                            }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${activeIsAnyLive ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`} />
                                            <span className="truncate max-w-[120px]">{item.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-2">
                        <a
                            href={stream.tiktok_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-black hover:bg-black hover:text-white px-6 py-3 sm:px-8 sm:py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-xl border border-white hover:border-black flex items-center gap-2"
                        >
                            Tonton di TikTok
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                            href="#catalog"
                            className="border border-white/20 text-white hover:bg-white/5 px-6 py-3 sm:px-8 sm:py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center"
                        >
                            Lihat Katalog Produk
                        </a>
                    </div>
                </div>

                {/* Smartphone Mockup with iframe (Right) */}
                <div className="flex justify-center order-1 md:order-2">
                    <div className="relative group/phone">
                        <div className="absolute inset-0 bg-red-500/10 rounded-[44px] blur-2xl group-hover/phone:bg-red-500/20 transition-all duration-500 pointer-events-none" />

                        <div className="relative w-[260px] h-[460px] sm:w-[300px] sm:h-[530px] bg-[#0c0f17] rounded-[44px] border-[10px] border-[#1f2833] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
                            
                            {/* Camera Speaker Notch */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1f2833] rounded-b-2xl z-20 flex items-center justify-center">
                                <div className="w-8 h-1 bg-gray-500 rounded-full" />
                            </div>

                            {/* Flash Live indicator */}
                            {isAnyLive && (
                                <div className="absolute top-10 left-6 z-20 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-widest shadow">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                    LIVE
                                </div>
                            )}

                            {/* Dynamic player */}
                            <div className="flex-1 w-full h-full relative">
                                {isTikTokLive ? (
                                    /* Custom High-Fidelity TikTok Live Mockup Screen */
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#161823] via-[#010101] to-[#161823] flex flex-col justify-between p-5 text-white font-sans select-none">
                                        
                                        {/* Top Header Row */}
                                        <div className="flex items-center justify-between mt-6">
                                            {/* Creator Info */}
                                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center font-bold text-white text-[9px] uppercase">
                                                    {stream.title ? stream.title[0] : 'i'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold leading-tight">iLOOK Store</span>
                                                    <span className="text-[8px] text-gray-300 leading-none">{getHandle(stream.tiktok_url)}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Live indicator */}
                                            <div className="flex items-center gap-1.5 bg-[#fe2c55] text-white text-[9px] font-bold px-2.5 py-0.5 rounded shadow">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                                <span>LIVE</span>
                                            </div>
                                        </div>

                                        {/* Center Visual: Large pulsing icon & wave */}
                                        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                                            {/* Pulsing Avatar Frame */}
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-[#fe2c55]/20 animate-ping scale-125" />
                                                <div className="absolute inset-0 rounded-full bg-[#25f4ee]/15 animate-ping scale-150" />
                                                
                                                <div className="w-20 h-20 rounded-full border-2 border-[#fe2c55] bg-[#121212] flex items-center justify-center overflow-hidden relative shadow-2xl">
                                                    <span className="text-white text-3xl font-black italic tracking-tighter">iL</span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-center space-y-1">
                                                <p className="text-xs font-bold tracking-wide uppercase text-[#fe2c55] animate-pulse">Sedang Berlangsung</p>
                                                <p className="text-[10px] text-gray-400 max-w-[180px] mx-auto leading-relaxed">Gabung sekarang untuk melihat koleksi terbaru kami</p>
                                            </div>

                                            {/* Audio / visual wave indicators */}
                                            <div className="flex items-end gap-1.5 h-6 mt-1">
                                                <span className="w-1 bg-[#fe2c55] rounded-full animate-bounce h-3" />
                                                <span className="w-1 bg-white rounded-full animate-bounce h-5" style={{ animationDelay: '0.2s' }} />
                                                <span className="w-1 bg-[#25f4ee] rounded-full animate-bounce h-4" style={{ animationDelay: '0.4s' }} />
                                                <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                                            </div>
                                        </div>

                                        {/* Bottom Action Area */}
                                        <div className="flex flex-col gap-2.5 pb-4">
                                            {/* CTA Button */}
                                            <a
                                                href={stream.tiktok_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-[#fe2c55] hover:bg-[#e0244a] active:scale-[0.98] text-white py-3.5 text-xs font-bold rounded-xl text-center shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 border border-red-400/10 uppercase tracking-widest"
                                            >
                                                <span>Tonton Live di TikTok</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <span className="text-[8px] text-gray-400 text-center uppercase tracking-wider">Membuka Aplikasi TikTok Anda</span>
                                        </div>

                                    </div>
                                ) : (
                                    /* Standard Video Embed */
                                    <iframe
                                        src={stream.embed_url}
                                        className="w-full h-full border-none bg-black"
                                        allowFullScreen
                                        scrolling="no"
                                        allow="encrypted-media;"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home({ products, categories, filters, activeLivestreams = [] }) {
    const { flashSale } = usePage().props;

    const [countdown, setCountdown] = useState({ h: '02', m: '45', s: '30' });

    useEffect(() => {
        let h = 2, m = 45, s = 30;
        const interval = setInterval(() => {
            if (s > 0) s--;
            else {
                s = 59;
                if (m > 0) m--;
                else { m = 59; if (h > 0) h--; }
            }
            setCountdown({
                h: String(h).padStart(2, '0'),
                m: String(m).padStart(2, '0'),
                s: String(s).padStart(2, '0'),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(val);
    };

    const handleCategoryClick = (categorySlug) => {
        const query = { ...filters };
        if (categorySlug) query.category = categorySlug;
        else delete query.category;
        router.get(route('storefront.home'), query, { preserveState: true });
    };

    // Hero images fallback
    const heroImage = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop&q=80';

    // Bento category images
    const bentoImages = [
        'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
    ];

    const bentoCategories = categories.length > 0
        ? categories.slice(0, 4)
        : [
            { name: 'BLOUSE', slug: 'blouse' },
            { name: 'KNITWEAR', slug: 'knitwear' },
            { name: 'PANTS', slug: 'pakaian-pria' },
            { name: 'DRESS', slug: 'dress' },
        ];

    return (
        <StorefrontLayout>
            <Head title="iLook Fashion | High-End Modern Wear" />

            {/* Hero Carousel — Full Screen */}
            <section className="relative w-full h-[60vh] sm:h-[80vh] overflow-hidden group">
                <div className="absolute inset-0 bg-black/15 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80"
                    alt="iLook Fashion Collection"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
                    <span className="text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white mb-4 opacity-90">
                        THE EXECUTIVE EDITORIAL
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-[64px] md:leading-none font-bold text-white mb-8 max-w-4xl uppercase tracking-wider sm:tracking-widest px-4">
                        MODERN CLASSIC
                    </h1>
                    <a
                        href="#catalog"
                        className="bg-white text-black px-8 py-3 sm:px-12 sm:py-4 text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-all duration-300"
                    >
                        BELANJA SEKARANG
                    </a>
                </div>
            </section>

            {/* Active TikTok Livestream / Video Section */}
            {activeLivestreams && activeLivestreams.length > 0 && (
                <ActiveLivestreamSection streams={activeLivestreams} />
            )}

            {/* Split Category Banners */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full mt-1">
                <div 
                    className="relative h-[40vh] sm:h-[55vh] overflow-hidden group cursor-pointer"
                    onClick={() => handleCategoryClick('dress')}
                >
                    <div className="absolute inset-0 bg-black/10 z-10 group-hover:bg-black/30 transition-colors duration-500" />
                    <img
                        src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80"
                        alt="Koleksi Wanita"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10">
                        <h3 className="text-white text-xl sm:text-2xl font-black uppercase tracking-[0.1em] mb-4">WOMEN'S COLLECTION</h3>
                        <div>
                            <span className="bg-white text-black font-bold uppercase tracking-[0.1em] text-[10px] px-6 py-3 sm:px-8 sm:py-3.5 inline-block hover:bg-black hover:text-white transition-colors duration-200">
                                JELAJAHI KOLEKSI
                            </span>
                        </div>
                    </div>
                </div>
                <div 
                    className="relative h-[40vh] sm:h-[55vh] overflow-hidden group cursor-pointer"
                    onClick={() => handleCategoryClick('pakaian-pria')}
                >
                    <div className="absolute inset-0 bg-black/10 z-10 group-hover:bg-black/30 transition-colors duration-500" />
                    <img
                        src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80"
                        alt="Koleksi Pria"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10">
                        <h3 className="text-white text-xl sm:text-2xl font-black uppercase tracking-[0.1em] mb-4">MEN'S COLLECTION</h3>
                        <div>
                            <span className="bg-white text-black font-bold uppercase tracking-[0.1em] text-[10px] px-6 py-3 sm:px-8 sm:py-3.5 inline-block hover:bg-black hover:text-white transition-colors duration-200">
                                JELAJAHI KOLEKSI
                            </span>
                        </div>
                    </div>
                </div>
            </section>
            {/* Dynamic Flash Sale Banner */}
            {flashSale && flashSale.is_active && flashSale.products && flashSale.products.length > 0 && (
                <FlashSaleBanner flashSale={flashSale} />
            )}


            {/* New Arrivals Grid */}
            <section id="catalog" className="py-12 px-4 md:py-20 md:px-10 max-w-[1280px] mx-auto bg-white">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666]">
                            {filters.category
                                ? categories.find(c => c.slug === filters.category)?.name || filters.category
                                : 'CURATED COLLECTION'}
                        </span>
                        <h2 className="text-2xl font-bold uppercase tracking-widest mt-1">
                            {filters.search ? `"${filters.search}"` : filters.category ? 'PRODUK' : 'NEW ARRIVALS'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-2 -mb-2 w-full md:overflow-x-visible md:pb-0 md:mb-0 border-b border-[#eeeeee] md:border-b-0">
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`flex-shrink-0 text-[11px] font-bold tracking-[0.1em] uppercase pb-2 md:pb-0.5 transition-colors ${
                                !filters.category
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-[#666666] hover:text-black'
                             }`}
                        >
                            Semua
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.slug)}
                                className={`flex-shrink-0 text-[11px] font-bold tracking-[0.1em] uppercase pb-2 md:pb-0.5 transition-colors ${
                                    filters.category === cat.slug
                                        ? 'text-black border-b-2 border-black'
                                        : 'text-[#666666] hover:text-black'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-xl font-bold uppercase tracking-widest text-[#111111] mb-2">Tidak Ada Produk</p>
                        <p className="text-sm text-[#666666] mb-8">Kami tidak menemukan produk yang sesuai dengan kriteria Anda.</p>
                        <button
                            onClick={() => router.get(route('storefront.home'))}
                            className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-opacity-80 transition-all"
                        >
                            RESET PENCARIAN
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                        {products.map((product) => {
                            const mainImage = product.images && product.images[0]
                                ? product.images[0]
                                : 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60';
                            const isFlashSale = product.is_flash_sale_active;
                            const discount = isFlashSale
                                ? (product.flash_sale?.discount_type === 'percentage' 
                                    ? Math.round(product.flash_sale.discount_value) 
                                    : Math.round((1 - product.flash_sale_price / product.base_price) * 100))
                                : (product.sale_price && product.base_price
                                    ? Math.round((1 - product.sale_price / product.base_price) * 100)
                                    : null);
                            return (
                                <Link
                                    key={product.id}
                                    href={route('storefront.product', product.slug)}
                                    className="group cursor-pointer block"
                                >
                                    {/* Image with hover effect */}
                                    <div className="relative aspect-[3/4] overflow-hidden bg-[#f7f7f7]">
                                        <img
                                            src={mainImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                        />
                                        {discount && (
                                            <span className="absolute top-3 left-3 bg-[#c22e2e] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm">
                                                {isFlashSale ? '⚡ ' : ''}{discount}% OFF
                                            </span>
                                        )}
                                        {/* Hover Slide-up Button */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#111111]/90 text-white py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            BELI SEKARANG
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <div className="mt-3.5 space-y-1">
                                        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#888888]">
                                            iLOOK
                                        </p>
                                        <h3 className="text-[13px] font-normal text-[#333333] group-hover:text-black transition-colors line-clamp-1">{product.name}</h3>
                                        <div className="flex items-center gap-2 pt-0.5">
                                            {isFlashSale ? (
                                                <>
                                                    <span className="text-[13px] font-bold text-[#c22e2e]">
                                                        {formatCurrency(product.flash_sale_price)}
                                                    </span>
                                                    <span className="text-[11px] text-[#888888] line-through">
                                                        {formatCurrency(product.base_price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[13px] font-bold text-black">
                                                        {formatCurrency(product.sale_price || product.base_price)}
                                                    </span>
                                                    {product.sale_price && (
                                                        <span className="text-[11px] text-[#888888] line-through">
                                                            {formatCurrency(product.base_price)}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Bento Grid — Kategori Populer */}
            <section className="pb-12 md:pb-20 px-4 md:px-10 max-w-[1280px] mx-auto">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 md:mb-10">Kategori Populer</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[600px] lg:h-[800px]">
                    {/* Large feature — col 1-2, row 1-2 */}
                    <div
                        className="col-span-2 row-span-2 md:col-span-2 md:row-span-2 relative group overflow-hidden bg-[#eeeeee] cursor-pointer min-h-[300px] md:min-h-0"
                        onClick={() => handleCategoryClick(bentoCategories[0]?.slug)}
                    >
                        <img
                            src={bentoImages[0]}
                            alt={bentoCategories[0]?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-8">
                            <h3 className="text-2xl sm:text-3xl md:text-[40px] font-black text-white uppercase leading-none mb-2">
                                {bentoCategories[0]?.name || 'BLOUSE'}
                            </h3>
                            <p className="text-[11px] font-bold tracking-[0.05em] uppercase text-white/80">JELAJAHI KOLEKSI</p>
                        </div>
                    </div>
                    {/* Top right — col 3-4, row 1 */}
                    <div
                        className="col-span-2 md:col-span-2 md:row-span-1 relative group overflow-hidden bg-[#eeeeee] cursor-pointer min-h-[160px] sm:min-h-[200px] md:min-h-0"
                        onClick={() => handleCategoryClick(bentoCategories[1]?.slug)}
                    >
                        <img
                            src={bentoImages[1]}
                            alt={bentoCategories[1]?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col justify-center items-center">
                            <h3 className="text-xl sm:text-3xl font-black text-white uppercase text-center">
                                {bentoCategories[1]?.name || 'DRESS'}
                            </h3>
                        </div>
                    </div>
                    {/* Bottom right left — col 3, row 2 */}
                    <div
                        className="col-span-1 md:col-span-1 md:row-span-1 relative group overflow-hidden bg-[#eeeeee] cursor-pointer min-h-[160px] sm:min-h-[200px] md:min-h-0"
                        onClick={() => handleCategoryClick(bentoCategories[2]?.slug)}
                    >
                        <img
                            src={bentoImages[2]}
                            alt={bentoCategories[2]?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center">
                            <h3 className="text-base sm:text-2xl font-black text-white uppercase text-center px-2">
                                {bentoCategories[2]?.name || 'PAKAIAN PRIA'}
                            </h3>
                        </div>
                    </div>
                    {/* Bottom right — col 4, row 2 */}
                    <div
                        className="col-span-1 md:col-span-1 md:row-span-1 relative group overflow-hidden bg-[#eeeeee] cursor-pointer min-h-[160px] sm:min-h-[200px] md:min-h-0"
                        onClick={() => handleCategoryClick(bentoCategories[3]?.slug)}
                    >
                        <img
                            src={bentoImages[3]}
                            alt={bentoCategories[3]?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center">
                            <h3 className="text-base sm:text-2xl font-black text-white uppercase text-center px-2">
                                {bentoCategories[3]?.name || 'KAOS'}
                            </h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Highlights */}
            <section className="border-y border-[#E0E0E0] py-10 px-6 md:py-16 md:px-10 bg-white">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <div className="flex flex-col items-center text-center">
                        <Truck className="w-9 h-9 mb-4 text-[#0a0a0a]" />
                        <h4 className="text-lg font-bold mb-2 text-[#0a0a0a]">Free Shipping</h4>
                        <p className="text-sm text-[#5d5f5f]">Gratis ongkir hingga IDR 10.000 tanpa minimum transaksi</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <RefreshCw className="w-9 h-9 mb-4 text-[#0a0a0a]" />
                        <h4 className="text-lg font-bold mb-2 text-[#0a0a0a]">Easy Returns</h4>
                        <p className="text-sm text-[#5d5f5f]">Gratis pengembalian barang maksimal 7 hari setelah diterima</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Store className="w-9 h-9 mb-4 text-[#0a0a0a]" />
                        <h4 className="text-lg font-bold mb-2 text-[#0a0a0a]">Click &amp; Collect</h4>
                        <p className="text-sm text-[#5d5f5f]">Belanja online, ambil di store pilihan tanpa minimum transaksi</p>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
