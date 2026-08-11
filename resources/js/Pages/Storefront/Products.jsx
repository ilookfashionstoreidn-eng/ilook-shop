import React from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heart } from 'lucide-react';

export default function Products({ products, categories, filters }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(val);
    };

    const handleCategoryClick = (categorySlug) => {
        const query = { ...filters };
        if (categorySlug) query.category = categorySlug;
        else delete query.category;
        router.get(route('storefront.products'), query, { preserveState: true, preserveScroll: true });
    };

    const activeCategoryName = filters.category
        ? categories.find(c => c.slug === filters.category)?.name || filters.category
        : null;

    return (
        <StorefrontLayout>
            <Head title={activeCategoryName ? `${activeCategoryName} - iLook Fashion` : 'Semua Produk - iLook Fashion'} />

            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 md:py-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-gray-100 pb-8">
                    <div>
                        <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-gray-400">
                            {activeCategoryName || 'FULL CATALOG'}
                        </span>
                        <h1 className="text-3xl font-extrabold uppercase tracking-wider mt-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {filters.search ? `"${filters.search}"` : 'SEMUA PRODUK'}
                        </h1>
                        <p className="text-xs text-gray-500 mt-2">{products.total} produk ditemukan</p>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-2 -mb-2 w-full md:w-auto md:overflow-x-visible md:pb-0 md:mb-0">
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`flex-shrink-0 px-4 py-2 text-[10px] font-extrabold tracking-[0.15em] uppercase rounded-full transition-all duration-300 cursor-pointer ${
                                !filters.category
                                    ? 'bg-black text-white shadow-md'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
                             }`}
                        >
                            Semua
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.slug)}
                                className={`flex-shrink-0 px-4 py-2 text-[10px] font-extrabold tracking-[0.15em] uppercase rounded-full transition-all duration-300 cursor-pointer ${
                                    filters.category === cat.slug
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {products.data.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-xl font-bold uppercase tracking-widest text-[#111111] mb-2">Tidak Ada Produk</p>
                        <p className="text-sm text-[#666666] mb-8">Kami tidak menemukan produk yang sesuai dengan kriteria Anda.</p>
                        <button
                            onClick={() => router.get(route('storefront.products'))}
                            className="bg-black text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all rounded-sm shadow-md cursor-pointer"
                        >
                            RESET PENCARIAN
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
                        {products.data.map((product) => {
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
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex items-center justify-center flex-wrap gap-2 mt-16">
                        {products.links.map((link, idx) => {
                            const label = link.label
                                .replace('&laquo; Previous', '←')
                                .replace('Next &raquo;', '→');
                            return (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                    className={`min-w-[36px] h-9 px-3 text-xs font-bold rounded-md transition-all ${
                                        link.active
                                            ? 'bg-black text-white'
                                            : link.url
                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
