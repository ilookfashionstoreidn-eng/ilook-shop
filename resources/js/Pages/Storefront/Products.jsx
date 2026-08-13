import React, { useState, useEffect } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heart } from 'lucide-react';

export default function Products({ products, categories, filters }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(val);
    };

    // Lazy-load ("Muat Lebih Banyak") state: 50 products per batch. We keep
    // our own accumulated list instead of rendering products.data directly
    // so clicking "load more" can append rather than replace. Switching
    // filters/category is a real Inertia navigation that gives us a fresh
    // page-1 result, so that's what resets the accumulated list below.
    const [allProducts, setAllProducts] = useState(products.data);
    const [nextPageUrl, setNextPageUrl] = useState(products.next_page_url);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setAllProducts(products.data);
        setNextPageUrl(products.next_page_url);
    }, [filters.category, filters.search, filters.promo]);

    const handleLoadMore = () => {
        if (!nextPageUrl || loadingMore) return;
        setLoadingMore(true);
        router.get(nextPageUrl, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['products'],
            onSuccess: (page) => {
                const newProducts = page.props.products;
                setAllProducts(prev => [...prev, ...newProducts.data]);
                setNextPageUrl(newProducts.next_page_url);
            },
            onFinish: () => setLoadingMore(false),
        });
    };

    const activeCategory = filters.category
        ? categories.find(c => c.slug === filters.category)
        : null;
    const activeCategoryName = activeCategory?.name || filters.category || null;

    // Subcategory pills for the current "family": if browsing a parent
    // category, show its children; if browsing a child, show its siblings
    // (plus a way back to the parent) so switching stays within context.
    let subCategories = [];
    let parentCategory = null;
    if (activeCategory) {
        if (!activeCategory.parent_id) {
            subCategories = categories.filter(c => c.parent_id === activeCategory.id);
        } else {
            parentCategory = categories.find(c => c.id === activeCategory.parent_id);
            subCategories = categories.filter(c => c.parent_id === activeCategory.parent_id);
        }
    }

    const goToCategory = (slug) => {
        router.get(route('storefront.products'), slug ? { category: slug } : {}, { preserveScroll: true });
    };

    return (
        <StorefrontLayout>
            <Head title={filters.promo ? 'Promo - iLook Fashion' : (activeCategoryName ? `${activeCategoryName} - iLook Fashion` : 'Semua Produk - iLook Fashion')} />

            {subCategories.length > 0 && (
                // Pinned right below StorefrontLayout's sticky stack (announcement
                // bar 36px + header 80px + category nav 40px = 156px) so the
                // filter pills stay reachable while scrolling a long product
                // list, instead of scrolling away with the rest of the header.
                // overflow-x-auto contains the horizontal scroll to this row —
                // without it, pills too wide for the viewport dragged the whole
                // page horizontally instead of just scrolling the row.
                <div className="sticky top-[156px] z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
                    <div className="max-w-[1280px] mx-auto flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar px-4 md:px-10 py-3">
                        {parentCategory && (
                            <button
                                onClick={() => goToCategory(parentCategory.slug)}
                                className={`flex-shrink-0 px-4 py-1.5 text-[10px] font-extrabold tracking-[0.12em] uppercase rounded-full whitespace-nowrap transition-all cursor-pointer ${
                                    activeCategory?.id === parentCategory.id
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
                                }`}
                            >
                                Semua {parentCategory.name}
                            </button>
                        )}
                        {subCategories.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => goToCategory(sub.slug)}
                                className={`flex-shrink-0 px-4 py-1.5 text-[10px] font-extrabold tracking-[0.12em] uppercase rounded-full whitespace-nowrap transition-all cursor-pointer ${
                                    activeCategory?.id === sub.id
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
                                }`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 md:py-16">
                {/* Header */}
                <div className="mb-10 border-b border-gray-100 pb-8">
                    <span className={`text-[10px] font-extrabold tracking-[0.2em] uppercase ${filters.promo ? 'text-red-600' : 'text-gray-400'}`}>
                        {filters.promo ? 'PENAWARAN SPESIAL' : (activeCategoryName || 'FULL CATALOG')}
                    </span>
                    <h1 className="text-3xl font-extrabold uppercase tracking-wider mt-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {filters.search ? `"${filters.search}"` : filters.promo ? 'PROMO' : 'SEMUA PRODUK'}
                    </h1>
                    <p className="text-xs text-gray-500 mt-2">
                        Menampilkan {allProducts.length} dari {products.total} produk
                    </p>
                </div>

                {/* Products Grid */}
                {allProducts.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-xl font-bold uppercase tracking-widest text-[#111111] mb-2">Tidak Ada Produk</p>
                        <p className="text-sm text-[#666666] mb-8">Kami tidak menemukan produk yang sesuai dengan kriteria Anda.</p>
                        <button
                            onClick={() => router.get(filters.promo ? route('storefront.promo') : route('storefront.products'))}
                            className="bg-black text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all rounded-sm shadow-md cursor-pointer"
                        >
                            RESET PENCARIAN
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
                        {allProducts.map((product) => {
                            const mainImage = product.images && product.images[0]
                                ? product.images[0]
                                : 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60';
                            const discount = product.sale_price && product.base_price
                                ? Math.round((1 - product.sale_price / product.base_price) * 100)
                                : null;
                            return (
                                <div key={product.id} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-55 flex-shrink-0">
                                        <Link href={route('storefront.product', product.slug)} className="block w-full h-full">
                                            <img
                                                src={mainImage}
                                                alt={product.name}
                                                loading="lazy"
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </Link>

                                        {discount && (
                                            <span className="absolute top-3 left-3 bg-[#c22e2e] text-white text-[9px] font-black px-2 py-0.75 uppercase tracking-wider rounded-md shadow-md">
                                                {discount}% OFF
                                            </span>
                                        )}

                                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-[#c22e2e] hover:bg-white shadow-md transition-all cursor-pointer border-none outline-none">
                                            <Heart className="w-4 h-4 fill-transparent transition-colors" />
                                        </button>

                                        <Link
                                            href={route('storefront.product', product.slug)}
                                            className="absolute bottom-0 left-0 right-0 bg-[#111111]/90 backdrop-blur-xs text-white py-3.5 text-[9px] font-bold tracking-[0.2em] uppercase text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                                        >
                                            BELI SEKARANG
                                        </Link>
                                    </div>
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
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Lazy load trigger — shows only once the current batch has rendered */}
                {nextPageUrl && (
                    <div className="flex justify-center mt-16">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="bg-black text-white px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all rounded-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loadingMore ? 'MEMUAT...' : 'MUAT LEBIH BANYAK'}
                        </button>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
