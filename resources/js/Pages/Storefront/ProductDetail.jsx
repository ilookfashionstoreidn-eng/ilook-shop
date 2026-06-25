import React, { useState, useEffect } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ChevronLeft, 
    ShoppingCart, 
    Check, 
    Plus, 
    Minus, 
    Truck, 
    Sparkles, 
    Boxes,
    Info,
    Star,
    MessageSquare,
    X
} from 'lucide-react';
import axios from 'axios';

export default function ProductDetail({ product, related, origin }) {
    const totalReviews = product.reviews ? product.reviews.length : 0;
    const avgRating = totalReviews > 0 
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    // Determine best initial image: first variant's image > product images[0] > placeholder
    const FALLBACK_IMG = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60';
    const getVariantImage = (variant) => variant?.image || (product.images && product.images[0]) || FALLBACK_IMG;

    const [selectedVariant, setSelectedVariant] = useState(product.variants && product.variants[0] ? product.variants[0] : null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(getVariantImage(product.variants && product.variants[0]));
    const [addedToCart, setAddedToCart] = useState(false);
    const [openAccordions, setOpenAccordions] = useState({
        description: true,
        shipping: false,
        sizeGuide: false,
    });
    const [showAllReviews, setShowAllReviews] = useState(false);

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Shipping Calculator State
    const [destCityQuery, setDestCityQuery] = useState('');
    const [citiesList, setCitiesList] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedCourier, setSelectedCourier] = useState('jne');
    const [shippingCosts, setShippingCosts] = useState([]);
    const [checkingShipping, setCheckingShipping] = useState(false);
    const [shippingSearchLoading, setShippingSearchLoading] = useState(false);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const handleQuantityChange = (type) => {
        if (type === 'inc') {
            if (selectedVariant && quantity < selectedVariant.stock) {
                setQuantity(prev => prev + 1);
            }
        } else {
            if (quantity > 1) {
                setQuantity(prev => prev - 1);
            }
        }
    };

    // Auto adjust quantity if it exceeds selected variant's stock
    // Also switch the active image to the variant's own photo when variant changes
    useEffect(() => {
        if (selectedVariant) {
            if (quantity > selectedVariant.stock) {
                setQuantity(selectedVariant.stock || 1);
            }
            // Switch main image to variant photo if it has one
            setActiveImage(getVariantImage(selectedVariant));
        }
    }, [selectedVariant]);

    // Handle adding to cart
    const handleAddToCart = () => {
        if (!selectedVariant) return;

        const cart = JSON.parse(localStorage.getItem('ilook_cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.variant_id === selectedVariant.id);

        if (existingItemIndex > -1) {
            // Update quantity
            const newQty = cart[existingItemIndex].quantity + quantity;
            cart[existingItemIndex].quantity = Math.min(newQty, selectedVariant.stock);
        } else {
            cart.push({
                product_id: product.id,
                variant_id: selectedVariant.id,
                product_name: product.name,
                variant_name: selectedVariant.name,
                sku: selectedVariant.sku,
                price: selectedVariant.price ?? product.sale_price ?? product.base_price,
                image: getVariantImage(selectedVariant),
                quantity: quantity,
                weight: product.weight
            });
        }

        localStorage.setItem('ilook_cart', JSON.stringify(cart));
        
        // Dispatch custom event to update count on Navbar
        window.dispatchEvent(new Event('cart-updated'));
        
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
    };

    // Live search destination cities
    useEffect(() => {
        if (destCityQuery.length < 3) {
            setCitiesList([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setShippingSearchLoading(true);
            try {
                const res = await axios.get(`/api/shipping/search-destination?q=${encodeURIComponent(destCityQuery)}`);
                if (res.data && res.data.success) {
                    setCitiesList(res.data.destinations || []);
                } else {
                    setCitiesList([]);
                }
            } catch (err) {
                console.error(err);
                setCitiesList([]);
            } finally {
                setShippingSearchLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [destCityQuery]);

    // Check Shipping Costs
    const handleCheckShipping = async () => {
        if (!selectedCityId) return;

        setCheckingShipping(true);
        setShippingCosts([]);
        try {
            const res = await axios.post('/api/shipping/cost', {
                destination_city_id: parseInt(selectedCityId),
                weight: product.weight * quantity,
                courier: selectedCourier
            });

            if (res.data && res.data.costs) {
                setShippingCosts(res.data.costs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCheckingShipping(false);
        }
    };

    const currentPrice = selectedVariant?.price ?? product.sale_price ?? product.base_price;

    return (
        <StorefrontLayout>
            <Head title={`${product.name} - iLook Fashion`} />

            <div className="px-4 sm:px-6 md:px-10 py-6 md:py-10 max-w-[1280px] mx-auto space-y-8 md:space-y-12">
                {/* Back button */}
                <Link 
                    href={route('storefront.home')}
                    className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-black transition-colors uppercase tracking-widest font-bold"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali ke Katalog</span>
                </Link>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Column: Hero image + variant thumbnails */}
                    <div className="lg:col-span-7 space-y-3">
                        {/* Main / Active Image */}
                        <div className="w-full aspect-[3/4] overflow-hidden bg-[#f7f7f7] relative">
                            <img
                                src={activeImage}
                                alt={`${product.name} — ${selectedVariant?.name || ''}`}
                                className="w-full h-full object-cover transition-all duration-500"
                                key={activeImage} // forces re-render / fade on change
                            />
                            {selectedVariant && (
                                <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                                    {selectedVariant.name}
                                </span>
                            )}
                        </div>

                        {/* Variant Thumbnail Strip */}
                        {product.variants && product.variants.some(v => v.image) && (
                            <div className="flex gap-2 flex-wrap">
                                {product.variants.map((v) => {
                                    const thumbImg = v.image || (product.images && product.images[0]) || FALLBACK_IMG;
                                    const isActive = selectedVariant?.id === v.id;
                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setSelectedVariant(v)}
                                            title={v.name}
                                            className={`w-16 h-16 rounded-none overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                                                isActive ? 'border-black scale-105' : 'border-transparent hover:border-[#aaa]'
                                            }`}
                                        >
                                            <img
                                                src={thumbImg}
                                                alt={v.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* If no variant images, show all product images stacked */}
                        {product.variants && !product.variants.some(v => v.image) && product.images && product.images.length > 1 && (
                            product.images.slice(1).map((imgUrl, idx) => (
                                <div key={idx} className="w-full aspect-[3/4] overflow-hidden bg-[#f7f7f7]">
                                    <img src={imgUrl} alt={`${product.name} - ${idx + 2}`} className="w-full h-full object-cover" />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Details Sticky Panel */}
                    <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-8 self-start">
                        {/* Title & Brand */}
                        <div className="space-y-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">
                                iLOOK
                            </span>
                            <h1 className="text-2xl font-bold text-black uppercase tracking-widest leading-snug">{product.name}</h1>
                            
                            {totalReviews > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center text-amber-400 gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-255'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[#555555] font-semibold">
                                        {avgRating} ({totalReviews} Ulasan)
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <span className="text-[11px] text-[#888888] font-mono tracking-wider">SKU: {selectedVariant?.sku || product.sku || '-'}</span>
                                {product.ginee_product_id && (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 uppercase tracking-wider">
                                        Active Stock Sync
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price Details */}
                        <div className="border-b border-[#eeeeee] pb-6">
                            <div className="flex items-baseline gap-3">
                                <span className={`text-2xl font-bold ${product.sale_price ? 'text-[#c22e2e]' : 'text-black'}`}>
                                    {formatCurrency(currentPrice)}
                                </span>
                                {product.sale_price && !selectedVariant?.price && (
                                    <span className="text-sm text-[#888888] line-through">
                                        {formatCurrency(product.base_price)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-black">Pilih Ukuran & Warna</h3>
                                <button 
                                    onClick={() => toggleAccordion('sizeGuide')}
                                    className="text-[10px] text-[#666666] hover:text-black uppercase tracking-wider underline font-bold"
                                >
                                    Panduan Ukuran
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {product.variants.map((v) => {
                                    const isSelected = selectedVariant?.id === v.id;
                                    const vThumb = v.image || null;
                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setSelectedVariant(v)}
                                            className={`p-3 rounded-none border text-left flex items-center gap-2.5 transition-all ${
                                                isSelected 
                                                    ? 'border-black bg-black text-white' 
                                                    : 'border-[#eeeeee] bg-white text-[#666666] hover:text-black hover:border-black'
                                            }`}
                                        >
                                            {vThumb && (
                                                <img
                                                    src={vThumb}
                                                    alt={v.name}
                                                    className={`w-8 h-8 object-cover rounded-sm flex-shrink-0 border ${
                                                        isSelected ? 'border-white/30' : 'border-[#eeeeee]'
                                                    }`}
                                                />
                                            )}
                                            <div className="flex flex-col justify-between gap-0.5 min-w-0">
                                                <span className="text-xs font-bold truncate uppercase tracking-wider leading-tight">{v.name}</span>
                                                <span className={`text-[10px] font-bold ${
                                                    v.stock === 0 ? 'text-[#c22e2e]' : v.stock <= 5 ? 'text-amber-600' : isSelected ? 'text-white/60' : 'text-[#888888]'
                                                }`}>
                                                    {v.stock === 0 ? 'Stok Habis' : `Stok: ${v.stock} pcs`}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Row Add to Cart */}
                        <div className="space-y-3.5 pt-4 border-t border-[#eeeeee]">
                            <div className="flex items-center gap-3">
                                {/* Quantity Adjuster */}
                                <div className="flex items-center border border-[#eeeeee] bg-white rounded-none h-14 px-2">
                                    <button
                                        onClick={() => handleQuantityChange('dec')}
                                        className="p-2 text-black hover:bg-[#f7f7f7]"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold text-black">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange('inc')}
                                        className="p-2 text-black hover:bg-[#f7f7f7]"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Cart CTA Button */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedVariant || selectedVariant.stock === 0}
                                    className={`flex-1 h-14 flex items-center justify-center gap-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                                        selectedVariant && selectedVariant.stock > 0
                                            ? addedToCart 
                                                ? 'bg-[#111111] text-white opacity-80'
                                                : 'bg-black hover:bg-black/90 text-white'
                                            : 'bg-[#eeeeee] border border-[#eeeeee] text-[#888888] cursor-not-allowed'
                                    }`}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>
                                        {selectedVariant && selectedVariant.stock > 0
                                            ? addedToCart ? 'Berhasil Ditambahkan' : 'Tambah Ke Keranjang'
                                            : 'Stok Habis'
                                        }
                                    </span>
                                </button>
                            </div>

                            {/* WhatsApp Inquiry Button (Direct executive style touch) */}
                            <a
                                href={`https://wa.me/6281234567890?text=Halo%20iLook%20Fashion,%20saya%20ingin%20tanya%20detail%20mengenai%20produk%20${encodeURIComponent(product.name)}%20(SKU:%20${selectedVariant?.sku || product.sku})`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-14 flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 rounded-none text-xs font-bold uppercase tracking-widest"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.031 2c-5.513 0-9.99 4.478-9.99 9.99 0 1.761.459 3.479 1.332 5.006L2 22l5.138-1.348a9.92 9.92 0 004.89 1.28c5.513 0 9.99-4.478 9.99-9.99S17.544 2 12.031 2zm0 18.294c-1.49 0-2.95-.398-4.228-1.155l-.304-.18-3.14.823.839-3.059-.197-.314a8.232 8.232 0 01-1.261-4.428c0-4.542 3.696-8.239 8.239-8.239 4.542 0 8.239 3.696 8.239 8.239 0 4.542-3.696 8.239-8.239 8.239z"/>
                                </svg>
                                <span>Tanya Detail Via WhatsApp</span>
                            </a>
                        </div>

                        {/* Collapsible Accordion sections */}
                        <div className="border-t border-[#eeeeee] space-y-1 pt-4">
                            {/* Accordion 1: Description */}
                            <div className="border-b border-[#eeeeee] pb-4">
                                <button 
                                    type="button"
                                    onClick={() => toggleAccordion('description')} 
                                    className="w-full py-3 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#111111] hover:opacity-75 transition-opacity"
                                >
                                    <span>Detail Produk</span>
                                    <span className="text-sm font-normal">{openAccordions.description ? '—' : '+'}</span>
                                </button>
                                {openAccordions.description && (
                                    <div 
                                        className="pb-2 text-xs text-[#666666] leading-relaxed font-sans prose prose-sm prose-slate"
                                        dangerouslySetInnerHTML={{ __html: product.description || 'Tidak ada deskripsi produk.' }}
                                    />
                                )}
                            </div>

                            {/* Accordion 2: Sizing Guide */}
                            <div className="border-b border-[#eeeeee] pb-4">
                                <button 
                                    type="button"
                                    onClick={() => toggleAccordion('sizeGuide')} 
                                    className="w-full py-3 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#111111] hover:opacity-75 transition-opacity"
                                >
                                    <span>Panduan Ukuran</span>
                                    <span className="text-sm font-normal">{openAccordions.sizeGuide ? '—' : '+'}</span>
                                </button>
                                {openAccordions.sizeGuide && (
                                    <div className="pb-2 text-xs text-[#666666] space-y-3 font-sans">
                                        <p>Gunakan panduan ini untuk memilih ukuran yang sesuai dengan lekuk tubuh Anda.</p>
                                        <table className="w-full text-left border-collapse border border-[#eeeeee] text-[11px]">
                                            <thead>
                                                <tr className="bg-[#f9f9f9] border-b border-[#eeeeee]">
                                                    <th className="p-2 font-bold uppercase">Ukuran</th>
                                                    <th className="p-2 font-bold uppercase">Lingkar Dada (cm)</th>
                                                    <th className="p-2 font-bold uppercase">Lingkar Pinggang (cm)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-[#eeeeee]">
                                                    <td className="p-2 font-bold">S</td>
                                                    <td className="p-2">90 - 94</td>
                                                    <td className="p-2">72 - 76</td>
                                                </tr>
                                                <tr className="border-b border-[#eeeeee]">
                                                    <td className="p-2 font-bold">M</td>
                                                    <td className="p-2">94 - 98</td>
                                                    <td className="p-2">76 - 80</td>
                                                </tr>
                                                <tr className="border-b border-[#eeeeee]">
                                                    <td className="p-2 font-bold">L</td>
                                                    <td className="p-2">98 - 102</td>
                                                    <td className="p-2">80 - 84</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 font-bold">XL</td>
                                                    <td className="p-2">102 - 106</td>
                                                    <td className="p-2">84 - 88</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Accordion 3: Shipping Estimator */}
                            <div className="border-b border-[#eeeeee] pb-4">
                                <button 
                                    type="button"
                                    onClick={() => toggleAccordion('shipping')} 
                                    className="w-full py-3 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#111111] hover:opacity-75 transition-opacity"
                                >
                                    <span>Estimasi Ongkos Kirim</span>
                                    <span className="text-sm font-normal">{openAccordions.shipping ? '—' : '+'}</span>
                                </button>
                                {openAccordions.shipping && (
                                    <div className="pb-2 space-y-4 pt-2">
                                        <div className="grid grid-cols-1 gap-3 text-xs">
                                            {/* Destination search input */}
                                            <div className="space-y-1 relative">
                                                <label className="text-[9px] text-[#888888] font-bold uppercase tracking-wider">Cari Kota Tujuan</label>
                                                <input 
                                                    type="text"
                                                    placeholder="Ketik nama kota..."
                                                    value={destCityQuery}
                                                    onChange={e => {
                                                        setDestCityQuery(e.target.value);
                                                        setSelectedCityId(''); // Reset selected city ID on typing
                                                        setShippingCosts([]); // Clear previous shipping costs
                                                    }}
                                                    className="w-full bg-white border border-[#eeeeee] focus:border-black focus:ring-0 rounded-none p-2 text-black placeholder-[#888888]"
                                                />
                                                {/* Dropdown list matches */}
                                                {citiesList.length > 0 && (
                                                    <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-none border border-[#eeeeee] bg-white p-1 z-30 shadow-lg">
                                                        {citiesList.map(city => (
                                                            <button
                                                                key={city.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedCityId(city.id);
                                                                    setDestCityQuery(city.label || city.name); // Komerce search returns "label"
                                                                    setCitiesList([]);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#f7f7f7] hover:text-black"
                                                            >
                                                                {city.label || city.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {shippingSearchLoading && (
                                                    <span className="absolute right-2 top-8 text-[10px] text-[#888888]">Mencari...</span>
                                                )}
                                            </div>

                                            {/* Courier Select */}
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-[#888888] font-bold uppercase tracking-wider">Kurir Ekspedisi</label>
                                                <select
                                                    value={selectedCourier}
                                                    onChange={e => setSelectedCourier(e.target.value)}
                                                    className="w-full bg-white border border-[#eeeeee] focus:border-black focus:ring-0 rounded-none p-2 text-black"
                                                >
                                                    <option value="jne">JNE Express</option>
                                                    <option value="jnt">J&T Express</option>
                                                    <option value="sicepat">SiCepat</option>
                                                    <option value="pos">POS Indonesia</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center text-[9px] text-[#888888] bg-[#fcfcfc] border border-[#eeeeee] p-2 rounded-none">
                                            <span className="flex items-center gap-1"><Boxes className="w-3 h-3" /> Total Berat: {((product.weight * quantity) / 1000).toFixed(2)} kg</span>
                                            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Dari: {origin.city_name}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleCheckShipping}
                                            disabled={!selectedCityId || checkingShipping}
                                            className="w-full py-2.5 bg-black hover:bg-black/90 text-xs font-bold rounded-none text-white transition-all disabled:opacity-50 uppercase tracking-widest"
                                        >
                                            {checkingShipping ? 'Menghitung...' : 'Cek Ongkir'}
                                        </button>

                                        {/* Shipping Options Output */}
                                        {shippingCosts.length > 0 && (
                                            <div className="space-y-1.5 pt-2 max-h-32 overflow-y-auto">
                                                {shippingCosts.map((rate, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-none bg-[#fdfdfd] border border-[#eeeeee] text-[11px]">
                                                        <div>
                                                            <span className="font-bold text-black">{rate.service}</span>
                                                            <span className="text-[9px] text-[#888888] ml-1.5">{rate.description}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-[#c22e2e]">{formatCurrency(rate.cost[0].value)}</span>
                                                            <span className="text-[9px] text-[#888888] block">Estimasi: {rate.cost[0].etd || '-'} hari</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ulasan Pelanggan Section */}
                <div className="border-t border-[#eeeeee] pt-12 space-y-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-black">Ulasan Pelanggan</h3>
                        <p className="text-xs text-[#888888] mt-1">Ulasan dari pembeli terverifikasi</p>
                    </div>

                    {totalReviews > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                            {/* Summary Card */}
                            <div className="md:col-span-4 bg-[#fcfcfc] border border-[#eeeeee] p-8 flex flex-col items-center justify-center text-center space-y-3">
                                <span className="text-5xl font-bold text-black tracking-tight">{avgRating}</span>
                                <div className="flex items-center text-amber-400 gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-255'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-[#888888] font-semibold">Berdasarkan {totalReviews} Ulasan</span>
                            </div>

                            {/* Ratings distribution progress bar */}
                            <div className="md:col-span-8 space-y-2.5 flex flex-col justify-center">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = product.reviews ? product.reviews.filter(r => r.rating === stars).length : 0;
                                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                    return (
                                        <div key={stars} className="flex items-center gap-3 text-xs text-[#666666]">
                                            <span className="w-16 font-semibold text-right">{stars} Bintang</span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-none overflow-hidden">
                                                <div 
                                                    className="h-full bg-black transition-all duration-500" 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-left text-[10px] text-[#888888]">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reviews list */}
                            <div className="md:col-span-12 border-t border-[#eeeeee] pt-6">
                                <div className="space-y-6 divide-y divide-[#eeeeee]">
                                    {product.reviews.slice(0, 3).map((review, idx) => (
                                        <div key={review.id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''}`}>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-black uppercase tracking-wider">
                                                            {review.user_name}
                                                        </span>
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-emerald-50 text-[9px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                                            Verified Buyer
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-amber-400 gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star
                                                                key={s}
                                                                className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-255'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-[#888888] font-mono">
                                                    {new Date(review.review_date || review.created_at).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="mt-3 text-xs text-[#555555] leading-relaxed font-sans font-medium">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {product.reviews.length > 3 && (
                                    <div className="text-center pt-8 border-t border-[#eeeeee] mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAllReviews(true)}
                                            className="px-6 py-3 border border-black text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all duration-300 rounded-none shadow-sm"
                                        >
                                            Lihat Semua Ulasan ({product.reviews.length})
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal Ulasan Pelanggan */}
                            {showAllReviews && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    {/* Backdrop */}
                                    <div 
                                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                                        onClick={() => setShowAllReviews(false)}
                                    />

                                    {/* Modal Box */}
                                    <div className="relative w-full max-w-2xl bg-white border border-[#eeeeee] p-6 sm:p-8 shadow-2xl flex flex-col max-h-[80vh] z-10 rounded-none">
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4 mb-6">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-black">Semua Ulasan</h3>
                                                <p className="text-[10px] text-[#888888] tracking-wider uppercase mt-1">Berdasarkan {totalReviews} Ulasan terverifikasi</p>
                                            </div>
                                            <button 
                                                onClick={() => setShowAllReviews(false)} 
                                                className="p-1.5 text-[#888888] hover:text-black transition-colors border border-[#eeeeee] hover:bg-gray-50"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Scrollable list */}
                                        <style dangerouslySetInnerHTML={{__html: `
                                            .custom-scrollbar::-webkit-scrollbar {
                                                width: 5px;
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-track {
                                                background: #fcfcfc;
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                                background: #e2e2e2;
                                                border-radius: 99px;
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                                background: #c5c5c5;
                                            }
                                        `}} />
                                        <div className="flex-1 overflow-y-auto pr-3 space-y-6 divide-y divide-[#eeeeee] font-sans custom-scrollbar">
                                            {product.reviews.map((review, idx) => (
                                                <div key={review.id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''}`}>
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-xs text-black uppercase tracking-wider">
                                                                    {review.user_name}
                                                                </span>
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-emerald-50 text-[9px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                                                    Verified Buyer
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-amber-400 gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star
                                                                        key={s}
                                                                        className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-255'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-[#888888] font-mono">
                                                            {new Date(review.review_date || review.created_at).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="mt-3 text-xs text-[#555555] leading-relaxed font-medium">
                                                            {review.comment}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-[#eeeeee] bg-[#fcfcfc]">
                            <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-[#888888]">Belum ada ulasan untuk produk ini.</p>
                        </div>
                    )}
                </div>

                {/* Related Products Section */}
                {related.length > 0 && (
                    <div className="space-y-6 border-t border-[#eeeeee] pt-12">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-black">Produk Terkait Lainnya</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {related.map((item) => {
                                const relImg = item.images && item.images[0] 
                                    ? item.images[0] 
                                    : 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=60';
                                return (
                                    <Link
                                        key={item.id}
                                        href={route('storefront.product', item.slug)}
                                        className="group bg-white border border-[#eeeeee] hover:border-black p-2.5 sm:p-4 block transition-colors duration-300 rounded-none"
                                    >
                                        <div className="aspect-[3/4] rounded-none overflow-hidden bg-[#f7f7f7]">
                                            <img src={relImg} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" />
                                        </div>
                                        <div className="mt-4 space-y-1">
                                            <p className="text-[8px] font-bold tracking-widest text-[#888888] uppercase">iLOOK</p>
                                            <h4 className="font-normal text-xs text-[#333333] group-hover:text-black truncate">{item.name}</h4>
                                            <p className="font-bold text-xs text-black pt-0.5">{formatCurrency(item.base_price)}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
