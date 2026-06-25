import React, { useState, useEffect } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Zap, Truck, RefreshCw, Store, ChevronRight } from 'lucide-react';

export default function Home({ products, categories, filters }) {

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

            {/* Flash Sale Banner */}
            <section className="bg-[#111111] py-8 px-6 md:py-10 md:px-10 text-white">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Zap className="w-8 h-8 text-white animate-pulse" />
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest">Flash Sale</h2>
                            <p className="text-xs text-white/60 mt-0.5">Penawaran terbatas, segera berakhir</p>
                        </div>
                    </div>
                    <div className="flex gap-3 sm:gap-4 items-center justify-center my-2 md:my-0">
                        <div className="flex flex-col items-center min-w-[45px] sm:min-w-[50px]">
                            <span className="text-3xl sm:text-4xl font-bold">{countdown.h}</span>
                            <span className="text-[9px] font-bold tracking-[0.05em] opacity-60 uppercase">Jam</span>
                        </div>
                        <span className="text-3xl sm:text-4xl font-bold mb-4">:</span>
                        <div className="flex flex-col items-center min-w-[45px] sm:min-w-[50px]">
                            <span className="text-3xl sm:text-4xl font-bold">{countdown.m}</span>
                            <span className="text-[9px] font-bold tracking-[0.05em] opacity-60 uppercase">Menit</span>
                        </div>
                        <span className="text-3xl sm:text-4xl font-bold mb-4">:</span>
                        <div className="flex flex-col items-center min-w-[45px] sm:min-w-[50px]">
                            <span className="text-3xl sm:text-4xl font-bold">{countdown.s}</span>
                            <span className="text-[9px] font-bold tracking-[0.05em] opacity-60 uppercase">Detik</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleCategoryClick(null)}
                        className="w-full md:w-auto border border-white px-8 py-3 text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-white hover:text-black transition-all"
                    >
                        LIHAT SEMUA
                    </button>
                </div>
            </section>

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
                            const discount = product.sale_price && product.base_price
                                ? Math.round((1 - product.sale_price / product.base_price) * 100)
                                : null;
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
                                            <span className="absolute top-3 left-3 bg-[#530A0C] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                                                {discount}% OFF
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
                                            <span className="text-[13px] font-bold text-black">
                                                {formatCurrency(product.sale_price || product.base_price)}
                                            </span>
                                            {product.sale_price && (
                                                <span className="text-[11px] text-[#888888] line-through">
                                                    {formatCurrency(product.base_price)}
                                                </span>
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
