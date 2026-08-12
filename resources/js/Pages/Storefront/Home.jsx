import React, { useState, useEffect } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Zap, Truck, RefreshCw, Store, ChevronRight, ChevronLeft, Play, ExternalLink, Heart } from 'lucide-react';

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
        <section className="bg-gradient-to-br from-[#090b14] via-[#121829] to-[#090b14] text-white py-14 px-4 md:py-20 md:px-10 border-b border-[#1e293b]/45 relative overflow-hidden select-none w-full my-6 rounded-3xl shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-12">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-extrabold text-3xl sm:text-5xl tracking-[0.2em] text-white flex items-center gap-2 uppercase drop-shadow-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            FLASH <span className="text-yellow-400 animate-pulse flex items-center">⚡</span> SALE
                        </span>
                    </div>

                    {(flashSale.start_time || flashSale.end_time) && (
                        <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/5 backdrop-blur-md px-7 py-4 border border-white/10 rounded-2xl mt-3 shadow-2xl">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">{statusText}</span>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center min-w-[40px]">
                                    <span className="text-2xl font-extrabold tracking-tight text-white">{timeLeft.h}</span>
                                    <span className="text-[7px] font-black tracking-widest text-gray-400 uppercase mt-1">Jam</span>
                                </div>
                                <span className="text-xl font-bold text-white/40 -mt-3.5">:</span>
                                <div className="flex flex-col items-center min-w-[40px]">
                                    <span className="text-2xl font-extrabold tracking-tight text-white">{timeLeft.m}</span>
                                    <span className="text-[7px] font-black tracking-widest text-gray-400 uppercase mt-1">Menit</span>
                                </div>
                                <span className="text-xl font-bold text-white/40 -mt-3.5">:</span>
                                <div className="flex flex-col items-center min-w-[40px]">
                                    <span className="text-2xl font-extrabold tracking-tight text-white">{timeLeft.s}</span>
                                    <span className="text-[7px] font-black tracking-widest text-gray-400 uppercase mt-1">Detik</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative w-full group/carousel">
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto scroll-smooth gap-4 sm:gap-6 pb-6 pt-2 snap-x snap-mandatory no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {flashSale.products.map((item) => {
                            const mainImage = item.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60';
                            
                            return (
                                <div key={item.id} className="min-w-[200px] w-[200px] sm:min-w-[250px] sm:w-[250px] snap-start bg-white text-black rounded-2xl overflow-hidden border border-gray-100 shadow-md flex flex-col group/card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                                        <img
                                            src={mainImage}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                        />

                                        <span className="absolute top-3 left-3 bg-[#c22e2e] text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-wider rounded-md shadow-md select-none">
                                            {item.discount_type === 'percentage' 
                                                ? `-${Math.round(item.discount_value)}%` 
                                                : `-${formatCurrency(item.discount_value)}`}
                                        </span>

                                        <Link
                                            href={route('storefront.product', item.slug)}
                                            className="absolute bottom-0 left-0 right-0 bg-[#111111]/90 backdrop-blur-xs text-white py-3.5 text-[9px] font-bold tracking-[0.2em] uppercase text-center transform translate-y-full group-hover/card:translate-y-0 transition-transform duration-300"
                                        >
                                            BELI SEKARANG
                                        </Link>
                                    </div>

                                    <div className="p-4 flex-grow flex flex-col justify-between gap-1.5 bg-white">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">
                                                {item.category_name}
                                            </p>
                                            <Link href={route('storefront.product', item.slug)}>
                                                <h3 className="text-xs sm:text-[13px] font-bold text-gray-800 hover:text-black transition-colors line-clamp-1 mt-1 leading-snug">
                                                    {item.name}
                                                </h3>
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-2.5 pt-1 mt-1">
                                            <span className="text-[11px] text-gray-400 line-through">
                                                {formatCurrency(item.base_price)}
                                            </span>
                                            <span className="text-[13px] sm:text-sm font-extrabold text-[#c22e2e]">
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

    // Parse username/handle from TikTok URL
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
        <section className="bg-gradient-to-br from-[#0a0a0a] via-[#151924] to-[#0a0a0a] text-white py-16 px-4 md:py-24 md:px-10 w-full relative overflow-hidden border-b border-gray-900 select-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl -ml-60 -mt-60 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -mr-60 -mb-60 pointer-events-none" />

            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
                
                {/* Content details (Left) */}
                <div className="flex flex-col gap-6 text-left order-2 md:order-1">
                    <div className="flex items-center gap-3">
                        {isAnyLive ? (
                            <span className="bg-[#fe2c55] text-white text-[10px] font-black px-3.5 py-1.5 rounded-md flex items-center gap-1.5 uppercase tracking-widest animate-pulse shadow-lg shadow-[#fe2c55]/20">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping mr-1" />
                                LIVE STREAMING
                            </span>
                        ) : (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-3.5 py-1.5 rounded-md flex items-center gap-1.5 uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                <Play className="w-3.5 h-3.5 text-white fill-white" />
                                VIDEO TERBARU
                            </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.25em]">iLOOK TIKTOK CHANNEL</span>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold uppercase tracking-tight leading-none text-white drop-shadow-sm line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {stream.title}
                        </h2>
                        <div className="w-24 h-[3px] bg-gradient-to-r from-[#fe2c55] to-emerald-500 rounded-full" />
                    </div>

                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-lg">
                        Tonton keseruan review koleksi fashion eksklusif kami secara langsung di TikTok! Dapatkan penawaran flash sale, diskon khusus, dan hadiah kejutan menarik selama acara berlangsung.
                    </p>

                    {/* Channel Selector Tabs (If more than 1 active live stream) */}
                    {streams.length > 1 && (
                        <div className="space-y-3.5 mt-2">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">PILIH SALURAN AKTIF:</span>
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
                                            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2.5 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-white text-black border-white shadow-lg'
                                                    : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <span className={`w-2.5 h-2.5 rounded-full ${activeIsAnyLive ? 'bg-[#fe2c55] animate-pulse' : 'bg-indigo-500'}`} />
                                            <span className="truncate max-w-[120px]">{item.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-4">
                        <a
                            href={stream.tiktok_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#fe2c55] text-white hover:bg-white hover:text-black px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-[#fe2c55]/10 border border-[#fe2c55] hover:border-white flex items-center gap-2 rounded-sm"
                        >
                            Tonton di TikTok
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                            href="#catalog"
                            className="border border-white/20 text-white hover:bg-white/5 px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center rounded-sm"
                        >
                            Lihat Katalog Produk
                        </a>
                    </div>
                </div>

                {/* Smartphone Mockup with iframe (Right) */}
                <div className="flex justify-center order-1 md:order-2">
                    <div className="relative group/phone">
                        <div className="absolute inset-0 bg-[#fe2c55]/10 rounded-[50px] blur-2xl group-hover/phone:bg-[#fe2c55]/20 transition-all duration-500 pointer-events-none" />

                        <div className="relative w-[270px] h-[480px] sm:w-[310px] sm:h-[550px] bg-[#0c0f17] rounded-[50px] border-[12px] border-[#1e2330] shadow-[0_0_40px_rgba(254,44,85,0.15)] overflow-hidden flex flex-col ring-1 ring-white/10">
                            
                            {/* Dynamic Island Notch */}
                            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5.5 bg-black rounded-full z-30 flex items-center justify-center">
                                <div className="w-4 h-1.5 bg-gray-900 rounded-full ml-auto mr-3" />
                            </div>

                            {/* Flash Live indicator */}
                            {isAnyLive && (
                                <div className="absolute top-12 left-5 z-20 bg-[#fe2c55] text-white text-[8px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-widest shadow">
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
                                        <div className="flex items-center justify-between mt-8">
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
                                        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 relative">
                                            {/* Pulsing Avatar Frame */}
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-[#fe2c55]/20 animate-ping scale-125" />
                                                <div className="absolute inset-0 rounded-full bg-[#25f4ee]/15 animate-ping scale-150" />
                                                
                                                <div className="w-20 h-20 rounded-full border-2 border-[#fe2c55] bg-[#121212] flex items-center justify-center overflow-hidden relative shadow-2xl">
                                                    <span className="text-white text-3xl font-black italic tracking-tighter">iL</span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-center space-y-1 z-10">
                                                <p className="text-xs font-bold tracking-wide uppercase text-[#fe2c55] animate-pulse">Sedang Berlangsung</p>
                                                <p className="text-[10px] text-gray-400 max-w-[180px] mx-auto leading-relaxed">Gabung sekarang untuk melihat koleksi terbaru kami</p>
                                            </div>

                                            {/* Audio / visual wave indicators */}
                                            <div className="flex items-end gap-1.5 h-6 mt-1 z-10">
                                                <span className="w-1 bg-[#fe2c55] rounded-full animate-bounce h-3" />
                                                <span className="w-1 bg-white rounded-full animate-bounce h-5" style={{ animationDelay: '0.2s' }} />
                                                <span className="w-1 bg-[#25f4ee] rounded-full animate-bounce h-4" style={{ animationDelay: '0.4s' }} />
                                                <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                                            </div>

                                            {/* Floating Hearts Reactions Container */}
                                            <div className="absolute bottom-0 right-4 flex flex-col items-center gap-3 pointer-events-none z-20">
                                                <span className="animate-heart-1 text-red-500 text-xl absolute opacity-0">❤️</span>
                                                <span className="animate-heart-2 text-pink-400 text-2xl absolute opacity-0">💖</span>
                                                <span className="animate-heart-3 text-purple-400 text-xl absolute opacity-0">💜</span>
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
            
            <style>{`
                @keyframes floatHeart {
                    0% { transform: translateY(0) scale(0.7) rotate(0deg); opacity: 0; }
                    15% { opacity: 0.9; }
                    85% { opacity: 0.9; }
                    100% { transform: translateY(-160px) scale(1.3) rotate(-20deg); opacity: 0; }
                }
                .animate-heart-1 {
                    animation: floatHeart 3.5s ease-in-out infinite;
                }
                .animate-heart-2 {
                    animation: floatHeart 3.5s ease-in-out infinite;
                    animation-delay: 1.2s;
                }
                .animate-heart-3 {
                    animation: floatHeart 3.5s ease-in-out infinite;
                    animation-delay: 2.3s;
                }
            `}</style>
        </section>
    );
}

function CategoryBannerCard({ images, tagline, title, onClick }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const count = images.length;

    useEffect(() => {
        if (count <= 1) return;
        const interval = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % count);
        }, 2000);
        return () => clearInterval(interval);
        // count is a stable primitive across re-renders (unlike the `images`
        // array literal, which is a new reference every parent render and
        // would otherwise keep tearing down/restarting this interval).
    }, [count]);

    return (
        <div
            className="relative h-[45vh] sm:h-[60vh] overflow-hidden group cursor-pointer"
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/35 transition-colors duration-500" />
            {images.map((src, idx) => (
                <img
                    key={src}
                    src={src}
                    alt={title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105 ${
                        idx === activeIdx ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionProperty: 'opacity, transform', transitionDuration: '700ms, 1500ms' }}
                />
            ))}
            {images.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex gap-1.5">
                    {images.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 sm:p-12">
                <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase mb-1">{tagline}</span>
                <h3 className="text-white text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.1em] mb-5">{title}</h3>
                <div>
                    <span className="bg-white text-black font-extrabold uppercase tracking-[0.15em] text-[10px] px-8 py-3.5 inline-block hover:bg-black hover:text-white transition-colors duration-300 shadow-md">
                        JELAJAHI KOLEKSI
                    </span>
                </div>
            </div>
        </div>
    );
}

function HighlightProductCard({ label, product, formatCurrency }) {
    // Unique color images: dedupe variant photos so the auto-cycle doesn't
    // repeat the same image back-to-back for size-only variants.
    const images = React.useMemo(() => {
        const seen = new Set();
        const imgs = [];
        (product.variants || []).forEach((v) => {
            if (v.image && !seen.has(v.image)) {
                seen.add(v.image);
                imgs.push(v.image);
            }
        });
        if (imgs.length === 0) {
            imgs.push(
                (product.images && product.images[0]) ||
                'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60'
            );
        }
        return imgs;
    }, [product]);

    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % images.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [images]);

    return (
        <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-55 flex-shrink-0">
                <span className="absolute top-3 left-3 z-10 bg-black text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-wider rounded-md shadow-md">
                    {label}
                </span>
                <Link href={route('storefront.product', product.slug)} className="block w-full h-full">
                    <img
                        key={activeIdx}
                        src={images[activeIdx]}
                        alt={product.name}
                        className="w-full h-full object-contain animate-fade-in"
                    />
                </Link>
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
                <Link
                    href={route('storefront.product', product.slug)}
                    className="absolute bottom-0 left-0 right-0 bg-[#111111]/90 backdrop-blur-xs text-white py-3.5 text-[9px] font-bold tracking-[0.2em] uppercase text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                >
                    BELI SEKARANG
                </Link>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between bg-white border-t border-gray-50">
                <div className="space-y-1">
                    <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">iLOOK</p>
                    <Link href={route('storefront.product', product.slug)}>
                        <h3 className="text-xs sm:text-[13px] font-bold text-gray-800 hover:text-black transition-colors line-clamp-1 mt-0.5 leading-snug">
                            {product.name}
                        </h3>
                    </Link>
                </div>
                <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-50/50">
                    <span className="text-[13px] sm:text-sm font-extrabold text-black">
                        {formatCurrency(product.sale_price || product.base_price)}
                    </span>
                    {product.sale_price && (
                        <span className="text-[11px] text-gray-400 line-through">
                            {formatCurrency(product.base_price)}
                        </span>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.4s ease-in-out; }
            `}</style>
        </div>
    );
}

export default function Home({ products, categories, filters, activeLivestreams = [], highlightProducts = [] }) {
    const { flashSale } = usePage().props;

    // Hero Banners Slider
    const heroSlides = [
        {
            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
            tagline: 'THE EXECUTIVE EDITORIAL',
            title: 'MODERN CLASSIC',
            link: '#catalog'
        },
        {
            image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80',
            tagline: 'SUMMER NEW IN',
            title: 'ELEVATED ESSENTIALS',
            link: '#catalog'
        },
        {
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
            tagline: 'EXCLUSIVELY FOR YOU',
            title: 'CHIC STYLING EDIT',
            link: '#catalog'
        }
    ];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

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

            {/* Hero Carousel — Full Screen Slide */}
            <section className="relative w-full h-[65vh] sm:h-[85vh] overflow-hidden group select-none">
                {heroSlides.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                            <div className="absolute inset-0 bg-black/25 z-10" />
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                                    isActive ? 'scale-105' : 'scale-100'
                                }`}
                            />
                            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
                                <span className={`text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-white mb-4 transition-all duration-700 delay-300 transform ${
                                    isActive ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4'
                                }`}>
                                    {slide.tagline}
                                </span>
                                <h1 className={`text-4xl sm:text-5xl md:text-[72px] md:leading-none font-extrabold text-white mb-8 max-w-4xl uppercase tracking-wider sm:tracking-widest px-4 transition-all duration-700 delay-500 transform ${
                                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                }`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {slide.title}
                                </h1>
                                <div className={`transition-all duration-700 delay-700 transform ${
                                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                }`}>
                                    <a
                                        href={slide.link}
                                        className="bg-white text-black px-10 py-3.5 sm:px-14 sm:py-4.5 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300 shadow-lg border border-white hover:border-black rounded-sm"
                                    >
                                        BELANJA SEKARANG
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
                    {heroSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 bg-white ${
                                idx === currentSlide ? 'w-8 bg-white' : 'opacity-50 hover:opacity-80'
                            } cursor-pointer`}
                            title={`Slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Active TikTok Livestream / Video Section */}
            {activeLivestreams && activeLivestreams.length > 0 && (
                <ActiveLivestreamSection streams={activeLivestreams} />
            )}

            {/* Split Category Banners */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1.5 w-full mt-1.5">
                <CategoryBannerCard
                    images={[
                        '/images/banners/women-1.png',
                        '/images/banners/women-2.png',
                        '/images/banners/women-3.webp',
                        '/images/banners/women-4.png',
                    ]}
                    tagline="ELEGANCE"
                    title="WOMEN'S COLLECTION"
                    onClick={() => handleCategoryClick('pakaian-wanita')}
                />
                <CategoryBannerCard
                    images={[
                        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=900&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=900&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80',
                    ]}
                    tagline="STRENGTH & STYLE"
                    title="MEN'S COLLECTION"
                    onClick={() => handleCategoryClick('pakaian-pria')}
                />
                <CategoryBannerCard
                    images={[
                        '/images/banners/kids-1.webp',
                        '/images/banners/kids-2.webp',
                        '/images/banners/kids-3.webp',
                        '/images/banners/kids-4.webp',
                    ]}
                    tagline="PLAYFUL & COZY"
                    title="KIDS' COLLECTION"
                    onClick={() => handleCategoryClick('pakaian-anak')}
                />
                <CategoryBannerCard
                    images={[
                        '/images/banners/family-1.webp',
                        '/images/banners/family-2.webp',
                        '/images/banners/family-3.webp',
                        '/images/banners/family-4.webp',
                    ]}
                    tagline="MATCHING MOMENTS"
                    title="FAMILY SET"
                    onClick={() => handleCategoryClick('family-set')}
                />
            </section>
            {/* Dynamic Flash Sale Banner */}
            {flashSale && flashSale.is_active && flashSale.products && flashSale.products.length > 0 && (
                <FlashSaleBanner flashSale={flashSale} />
            )}


            {/* New Arrivals Grid */}
            <section id="catalog" className="py-16 px-4 md:py-24 md:px-10 max-w-[1280px] mx-auto bg-white">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-gray-100 pb-8">
                    <div>
                        <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-gray-400">
                            {filters.category
                                ? categories.find(c => c.slug === filters.category)?.name || filters.category
                                : 'CURATED COLLECTION'}
                        </span>
                        <h2 className="text-3xl font-extrabold uppercase tracking-wider mt-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {filters.search ? `"${filters.search}"` : filters.category ? 'PRODUK' : 'NEW ARRIVALS'}
                        </h2>
                        <Link
                            href={route('storefront.products', filters.category ? { category: filters.category } : {})}
                            className="inline-block mt-2 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black underline underline-offset-4 transition-colors"
                        >
                            Lihat Semua Produk →
                        </Link>
                    </div>
                </div>

                {/* Highlight Grid — 1 spotlight product per family (Wanita/Pria/Anak/Family), auto-cycling color */}
                {!filters.category && !filters.search ? (
                    highlightProducts.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-xl font-bold uppercase tracking-widest text-[#111111] mb-2">Tidak Ada Produk</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {highlightProducts.map(({ label, product }) => (
                                <HighlightProductCard key={product.id} label={label} product={product} formatCurrency={formatCurrency} />
                            ))}
                        </div>
                    )
                ) : products.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-xl font-bold uppercase tracking-widest text-[#111111] mb-2">Tidak Ada Produk</p>
                        <p className="text-sm text-[#666666] mb-8">Kami tidak menemukan produk yang sesuai dengan kriteria Anda.</p>
                        <button
                            onClick={() => router.get(route('storefront.home'))}
                            className="bg-black text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all rounded-sm shadow-md cursor-pointer"
                        >
                            RESET PENCARIAN
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth">
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
                                <div key={product.id} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex-shrink-0 snap-start w-[45vw] sm:w-[240px]">
                                    {/* Image with hover effect */}
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-55 flex-shrink-0">
                                        <Link href={route('storefront.product', product.slug)} className="block w-full h-full">
                                            <img
                                                src={mainImage}
                                                alt={product.name}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </Link>

                                        {discount && (
                                            <span className="absolute top-3 left-3 bg-[#c22e2e] text-white text-[9px] font-black px-2 py-0.75 uppercase tracking-wider rounded-md shadow-md">
                                                {isFlashSale ? '⚡ ' : ''}{discount}% OFF
                                            </span>
                                        )}

                                        {/* Floating Heart Icon for Wishlist (Simulated UI) */}
                                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-[#c22e2e] hover:bg-white shadow-md transition-all cursor-pointer border-none outline-none">
                                            <Heart className="w-4 h-4 fill-transparent transition-colors" />
                                        </button>

                                        {/* Hover Slide-up Button */}
                                        <Link
                                            href={route('storefront.product', product.slug)}
                                            className="absolute bottom-0 left-0 right-0 bg-[#111111]/90 backdrop-blur-xs text-white py-3.5 text-[9px] font-bold tracking-[0.2em] uppercase text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                                        >
                                            BELI SEKARANG
                                        </Link>
                                    </div>
                                    {/* Info */}
                                    <div className="p-4 flex-grow flex flex-col justify-between bg-white border-t border-gray-50">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">
                                                iLOOK
                                            </p>
                                            <Link href={route('storefront.product', product.slug)}>
                                                <h3 className="text-xs sm:text-[13px] font-bold text-gray-800 hover:text-black transition-colors line-clamp-1 mt-0.5 leading-snug">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-50/50">
                                            {isFlashSale ? (
                                                <>
                                                    <span className="text-[13px] sm:text-sm font-extrabold text-[#c22e2e]">
                                                        {formatCurrency(product.flash_sale_price)}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 line-through">
                                                        {formatCurrency(product.base_price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[13px] sm:text-sm font-extrabold text-black">
                                                        {formatCurrency(product.sale_price || product.base_price)}
                                                    </span>
                                                    {product.sale_price && (
                                                        <span className="text-[11px] text-gray-400 line-through">
                                                            {formatCurrency(product.base_price)}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Kategori Populer — 4 equal columns */}
            <section className="pb-16 md:pb-24 px-4 md:px-10 max-w-[1280px] mx-auto select-none">
                <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-8 md:mb-12 text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Kategori Populer</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                    {bentoCategories.map((cat, idx) => (
                        <div
                            key={cat?.slug || idx}
                            className="relative group overflow-hidden bg-[#eeeeee] cursor-pointer aspect-[3/4] rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500"
                            onClick={() => handleCategoryClick(cat?.slug)}
                        >
                            <img
                                src={bentoImages[idx]}
                                alt={cat?.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-5 md:p-6">
                                <h3 className="text-xl md:text-2xl font-black text-white lowercase leading-none mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {(cat?.name || '').toLowerCase()}
                                </h3>
                                <p className="text-[11px] font-medium lowercase text-white/80">collection</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Service Highlights */}
            <section className="border-t border-gray-150 py-16 px-6 md:py-24 md:px-10 bg-gray-50/50 select-none">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    <div className="flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <Truck className="w-6 h-6 text-[#111111]" />
                        </div>
                        <h4 className="text-lg font-bold mb-2.5 text-[#111111]">Free Shipping</h4>
                        <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">Gratis ongkir hingga IDR 10.000 tanpa minimum transaksi</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <RefreshCw className="w-6 h-6 text-[#111111]" />
                        </div>
                        <h4 className="text-lg font-bold mb-2.5 text-[#111111]">Easy Returns</h4>
                        <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">Gratis pengembalian barang maksimal 7 hari setelah diterima</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <Store className="w-6 h-6 text-[#111111]" />
                        </div>
                        <h4 className="text-lg font-bold mb-2.5 text-[#111111]">Click &amp; Collect</h4>
                        <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">Belanja online, ambil di store pilihan tanpa minimum transaksi</p>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
