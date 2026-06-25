import React, { useState, useEffect } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Trash2, 
    Plus, 
    Minus, 
    ShoppingBag, 
    ArrowRight, 
    ChevronLeft 
} from 'lucide-react';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    // Load cart on mount
    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('ilook_cart') || '[]');
        setCartItems(cart);
    }, []);

    const updateCartInStorage = (updatedCart) => {
        localStorage.setItem('ilook_cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        // Trigger navbar update
        window.dispatchEvent(new Event('cart-updated'));
    };

    const handleQtyChange = (variantId, action) => {
        const updated = cartItems.map(item => {
            if (item.variant_id === variantId) {
                let newQty = action === 'inc' ? item.quantity + 1 : item.quantity - 1;
                // Stock limit will be verified on the server checkout, local bounds are just min 1
                return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
        });
        updateCartInStorage(updated);
    };

    const handleRemoveItem = (variantId) => {
        const filtered = cartItems.filter(item => item.variant_id !== variantId);
        updateCartInStorage(filtered);
    };

    const totalWeight = cartItems.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <StorefrontLayout>
            <Head title="Keranjang Belanja - iLook Fashion" />

            <div className="px-10 py-10 max-w-[1280px] mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-widest text-[#212121] uppercase">Keranjang Belanja</h1>
                    <Link 
                        href={route('storefront.home')}
                        className="inline-flex items-center gap-1.5 text-xs text-[#747878] hover:text-[#212121] transition-colors uppercase tracking-wider font-bold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Lanjut Belanja</span>
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white border border-[#E0E0E0] rounded-none p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="bg-[#f9f9f9] border border-[#E0E0E0] text-[#747878] p-4 rounded-none">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-[#212121] uppercase tracking-wider">Keranjang Anda Kosong</h4>
                            <p className="text-[#747878] text-xs mt-1">Anda belum menambahkan produk apa pun ke keranjang belanja.</p>
                        </div>
                        <Link 
                            href={route('storefront.home')}
                            className="px-6 py-3 text-xs font-bold bg-[#212121] hover:opacity-90 text-white rounded-none transition-all uppercase tracking-wider"
                        >
                            Mulai Berbelanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart items list */}
                        <div className="lg:col-span-8 space-y-4">
                            {cartItems.map((item) => (
                                <div 
                                    key={item.variant_id} 
                                    className="bg-white p-4 rounded-none border border-[#E0E0E0] flex items-center gap-4 text-xs"
                                >
                                    {/* Thumb */}
                                    <div className="w-16 h-20 rounded-none overflow-hidden bg-[#f9f9f9] border border-[#E0E0E0] flex-shrink-0">
                                        <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Product and variant names */}
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-[#212121] text-sm truncate uppercase tracking-wider">{item.product_name}</h3>
                                        <p className="text-[#747878] mt-0.5">Varian: {item.variant_name}</p>
                                        <p className="text-[#212121] font-extrabold mt-1.5">{formatCurrency(item.price)}</p>
                                    </div>

                                    {/* Actions & total */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {/* Qty incrementer */}
                                        <div className="flex items-center border border-[#E0E0E0] bg-white rounded-none p-0.5">
                                            <button
                                                onClick={() => handleQtyChange(item.variant_id, 'dec')}
                                                className="p-1.5 text-[#212121] hover:bg-[#f9f9f9] rounded-none"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-[#212121]">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQtyChange(item.variant_id, 'inc')}
                                                className="p-1.5 text-[#212121] hover:bg-[#f9f9f9] rounded-none"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Item Total Price */}
                                        <span className="font-extrabold text-[#212121] w-24 text-right hidden sm:inline">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>

                                        {/* Trash Delete button */}
                                        <button
                                            onClick={() => handleRemoveItem(item.variant_id)}
                                            className="p-2 rounded-none bg-white text-[#530A0C] border border-[#E0E0E0] hover:bg-red-50 transition-all"
                                            title="Hapus Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Checkout Card */}
                        <div className="lg:col-span-4 bg-white p-6 rounded-none border border-[#E0E0E0] space-y-4 text-xs text-[#747878]">
                            <h3 className="text-sm font-extrabold text-[#212121] border-b border-[#E0E0E0] pb-2 uppercase tracking-widest">Ringkasan Belanja</h3>
                            
                            <div className="flex justify-between items-center">
                                <span>Total Item</span>
                                <span className="font-bold text-[#212121]">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} Pcs</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>Total Berat</span>
                                <span className="font-bold text-[#212121]">{(totalWeight / 1000).toFixed(2)} kg</span>
                            </div>

                            <div className="border-t border-[#E0E0E0] pt-3 flex justify-between items-baseline">
                                <span className="text-[#212121] font-bold">Subtotal</span>
                                <span className="text-lg font-extrabold text-[#212121]">{formatCurrency(subtotal)}</span>
                            </div>

                            <Link
                                href={route('storefront.checkout')}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-none text-xs font-bold bg-[#212121] hover:opacity-90 text-white transition-all uppercase tracking-wider"
                            >
                                <span>Lanjut ke Pembayaran</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
