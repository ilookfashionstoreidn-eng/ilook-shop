import React, { useState, useEffect, useRef } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    MapPin, 
    Truck, 
    CreditCard, 
    ArrowRight, 
    Check, 
    X,
    ChevronRight,
    AlertCircle,
    Shield,
    Wallet,
    Building2,
    QrCode,
    Loader2,
    Ticket,
    Tag,
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Checkout({ provinces, activeCouriers, originCityId, midtransClientKey, midtransSnapUrl, bankAccounts = [] }) {
    const [cartItems, setCartItems] = useState([]);
    
    // Form States
    const [buyerName, setBuyerName] = useState('');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [address, setAddress] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedProvinceName, setSelectedProvinceName] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');
    const [postalCode, setPostalCode] = useState('');

    // Shipping selection States
    const [selectedCourier, setSelectedCourier] = useState(activeCouriers[0] || 'jne');
    const [shippingServices, setShippingServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [shippingCost, setShippingCost] = useState(0);

    // Flow States
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: Alamat, 2: Pengiriman & Pembayaran
    
    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState('midtrans'); // midtrans | manual_transfer
    const [selectedBankAccountId, setSelectedBankAccountId] = useState(bankAccounts[0]?.id || null);

    useEffect(() => {
        if (bankAccounts && bankAccounts.length > 0 && !selectedBankAccountId) {
            setSelectedBankAccountId(bankAccounts[0].id);
        }
    }, [bankAccounts]);

    // Snap.js script loaded state
    const snapScriptLoaded = useRef(false);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode) return;

        setApplyingCoupon(true);
        setCouponError('');
        try {
            const res = await axios.post('/api/coupon/apply', {
                code: couponCode,
                subtotal: subtotal,
                items: cartItems.map(i => ({
                    variant_id: i.variant_id,
                    quantity: i.quantity
                }))
            });

            if (res.data?.success) {
                setAppliedCoupon(res.data);
                setCouponDiscount(res.data.discount_amount);
                setCouponError('');
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Gagal menerapkan kupon diskon.';
            setCouponError(errMsg);
            setAppliedCoupon(null);
            setCouponDiscount(0);

            // SweetAlert warning for Flash Sale items
            if (errMsg.includes('Flash Sale')) {
                Swal.fire({
                    title: 'Kupon Tidak Berlaku',
                    text: errMsg,
                    icon: 'warning',
                    confirmButtonText: 'Baik, Saya Mengerti',
                    confirmButtonColor: '#212121', // Dark style
                    customClass: {
                        popup: 'rounded-none border border-[#E0E0E0] font-sans',
                        confirmButton: 'rounded-none px-6 py-2.5 text-xs font-bold uppercase tracking-wider'
                    }
                });
            }
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
    };

    // Load cart items on mount
    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('ilook_cart') || '[]');
        setCartItems(cart);
        
        // Populate default emails if auth is present
        const auth = router.page?.props?.auth;
        if (auth && auth.user) {
            setBuyerName(auth.user.name);
            setBuyerEmail(auth.user.email);
            if (auth.user.phone) {
                setBuyerPhone(auth.user.phone);
            }
        }
    }, []);

    // Load Midtrans Snap.js script
    useEffect(() => {
        if (snapScriptLoaded.current || !midtransSnapUrl) return;
        
        const existingScript = document.getElementById('midtrans-snap-script');
        if (existingScript) {
            snapScriptLoaded.current = true;
            return;
        }

        const script = document.createElement('script');
        script.id = 'midtrans-snap-script';
        script.src = midtransSnapUrl || 'https://app.sandbox.midtrans.com/snap/snap.js';
        if (midtransClientKey) {
            script.setAttribute('data-client-key', midtransClientKey);
        }
        script.onload = () => {
            snapScriptLoaded.current = true;
        };
        document.head.appendChild(script);

        return () => {
            // Jangan hapus script saat unmount agar tidak perlu load ulang
        };
    }, [midtransClientKey, midtransSnapUrl]);

    // Load cities when province changes
    useEffect(() => {
        if (!selectedProvinceId) {
            setCities([]);
            return;
        }

        const loadCities = async () => {
            setLoadingCities(true);
            setCities([]);
            setSelectedCityId('');
            try {
                const res = await axios.get(`/api/shipping/cities/${selectedProvinceId}`);
                if (res.data && res.data.success) {
                    setCities(res.data.cities);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingCities(false);
            }
        };

        loadCities();
    }, [selectedProvinceId]);

    // Load shipping costs when destination city or courier changes
    const fetchShippingRates = async () => {
        if (!selectedCityId || !selectedCourier) return;

        setLoadingShipping(true);
        setShippingServices([]);
        setSelectedService('');
        setShippingCost(0);

        try {
            const res = await axios.post('/api/shipping/cost', {
                destination_city_id: parseInt(selectedCityId),
                weight: totalWeight,
                courier: selectedCourier
            });

            if (res.data && res.data.costs) {
                setShippingServices(res.data.costs);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('Gagal memuat tarif pengiriman. Coba ganti kurir.');
        } finally {
            setLoadingShipping(false);
        }
    };

    // Trigger load shipping when courier changes in Step 2
    useEffect(() => {
        if (checkoutStep === 2 && selectedCityId) {
            fetchShippingRates();
        }
    }, [selectedCourier, checkoutStep]);

    const totalWeight = cartItems.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = Math.max(0, subtotal + shippingCost - couponDiscount);

    const handleProvinceChange = (e) => {
        const provId = e.target.value;
        setSelectedProvinceId(provId);
        const provObj = provinces.find(p => p.province_id == provId);
        setSelectedProvinceName(provObj ? provObj.province : '');
    };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setSelectedCityId(cityId);
        const cityObj = cities.find(c => c.city_id == cityId);
        setSelectedCityName(cityObj ? (cityObj.type ? `${cityObj.type} ${cityObj.city_name}` : cityObj.city_name) : '');
    };

    const handleServiceSelect = (serviceName, costVal) => {
        setSelectedService(serviceName);
        setShippingCost(costVal);
    };

    // Move to next step validations
    const handleNextStep = (e) => {
        e.preventDefault();
        if (!buyerName || !buyerEmail || !buyerPhone || !address || !selectedProvinceId || !selectedCityId || !postalCode) {
            setErrorMessage('Silakan lengkapi seluruh kolom alamat pengiriman.');
            return;
        }
        setErrorMessage('');
        setCheckoutStep(2);
    };

    // Submit complete checkout — buat order dulu, lalu initiate Midtrans payment
    const handleSubmitCheckout = async () => {
        if (!selectedService) {
            setErrorMessage('Silakan pilih salah satu layanan pengiriman kurir.');
            return;
        }

        setSubmittingOrder(true);
        setErrorMessage('');

        const orderData = {
            buyer_name: buyerName,
            buyer_email: buyerEmail,
            buyer_phone: buyerPhone,
            address: address,
            province_id: parseInt(selectedProvinceId),
            province_name: selectedProvinceName,
            city_id: parseInt(selectedCityId),
            city_name: selectedCityName,
            courier: selectedCourier,
            shipping_service: selectedService,
            shipping_cost: shippingCost,
            weight: totalWeight,
            postal_code: postalCode,
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
            payment_method: paymentMethod,
            bank_account_id: paymentMethod === 'manual_transfer' ? selectedBankAccountId : null,
            items: cartItems.map(i => ({
                variant_id: i.variant_id,
                quantity: i.quantity
            }))
        };

        try {
            // Step 1: Buat order (status: pending_payment)
            const orderRes = await axios.post('/checkout', orderData);
            
            if (!orderRes.data?.success) {
                setErrorMessage(orderRes.data?.message || 'Gagal memproses checkout.');
                setSubmittingOrder(false);
                return;
            }

            const orderId = orderRes.data.order_id;
            setSubmittingOrder(false);

            if (paymentMethod === 'manual_transfer') {
                localStorage.removeItem('ilook_cart');
                window.dispatchEvent(new Event('cart-updated'));
                router.get(route('storefront.order.pending', orderId));
                return;
            }

            setPaymentLoading(true);

            // Step 2: Ambil Snap Token dari Midtrans
            const paymentRes = await axios.post(`/orders/${orderId}/payment/initiate`);
            
            if (!paymentRes.data?.success) {
                // Jika Midtrans tidak terkonfigurasi (keys kosong), redirect ke halaman pending
                setPaymentLoading(false);
                localStorage.removeItem('ilook_cart');
                window.dispatchEvent(new Event('cart-updated'));
                router.get(route('storefront.order.pending', orderId));
                return;
            }

            const snapToken = paymentRes.data.snap_token;
            setPaymentLoading(false);

            // Step 3: Buka popup Midtrans Snap
            if (window.snap && snapToken) {
                // Hapus cart lebih awal agar tidak ter-double jika user navigate keluar
                localStorage.removeItem('ilook_cart');
                window.dispatchEvent(new Event('cart-updated'));

                window.snap.pay(snapToken, {
                    onSuccess: (result) => {
                        console.log('Payment success:', result);
                        router.get(route('storefront.order.success', orderId));
                    },
                    onPending: (result) => {
                        console.log('Payment pending:', result);
                        router.get(route('storefront.order.pending', orderId));
                    },
                    onError: (result) => {
                        console.error('Payment error:', result);
                        setErrorMessage('Pembayaran gagal. Silakan coba lagi atau pilih metode lain.');
                    },
                    onClose: () => {
                        console.log('Snap popup closed by user');
                        // Jika user tutup popup tanpa bayar, arahkan ke halaman pending
                        router.get(route('storefront.order.pending', orderId));
                    },
                });
            } else {
                // Snap.js belum load atau token tidak ada
                console.warn('Snap.js not loaded or token missing, redirecting to pending page');
                router.get(route('storefront.order.pending', orderId));
            }

        } catch (err) {
            console.error('Checkout error:', err);
            setErrorMessage(err.response?.data?.message || 'Terjadi kesalahan sistem saat checkout.');
            setSubmittingOrder(false);
            setPaymentLoading(false);
        }
    };

    const paymentMethods = [
        { icon: Building2, label: 'Virtual Account', desc: 'BCA, BNI, BRI, Mandiri, Permata' },
        { icon: Wallet, label: 'E-Wallet', desc: 'GoPay, OVO, Dana, ShopeePay' },
        { icon: QrCode, label: 'QRIS', desc: 'Semua dompet digital' },
        { icon: CreditCard, label: 'Kartu Kredit/Debit', desc: 'Visa, Mastercard' },
    ];

    const isProcessing = submittingOrder || paymentLoading;

    return (
        <StorefrontLayout>
            <Head title="Proses Checkout - iLook Fashion" />

            <div className="px-10 py-10 max-w-[1280px] mx-auto space-y-8">
                {/* Checkout Page title */}
                <div className="border-b border-[#E0E0E0] pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-widest text-[#212121] uppercase">Penyelesaian Pesanan</h1>
                    <p className="text-[#747878] text-xs mt-0.5">Selesaikan detail pengiriman & metode pembayaran Anda.</p>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#747878]">
                    <div className={`flex items-center gap-1.5 ${checkoutStep >= 1 ? 'text-[#212121]' : ''}`}>
                        <span className={`w-5 h-5 rounded-none flex items-center justify-center border text-[10px] ${checkoutStep >= 1 ? 'border-[#212121] bg-[#212121] text-white font-extrabold' : 'border-[#E0E0E0]'}`}>1</span>
                        <span>Alamat Kirim</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#747878]" />
                    <div className={`flex items-center gap-1.5 ${checkoutStep >= 2 ? 'text-[#212121]' : ''}`}>
                        <span className={`w-5 h-5 rounded-none flex items-center justify-center border text-[10px] ${checkoutStep >= 2 ? 'border-[#212121] bg-[#212121] text-white font-extrabold' : 'border-[#E0E0E0]'}`}>2</span>
                        <span>Pengiriman & Pembayaran</span>
                    </div>
                </div>

                {errorMessage && (
                    <div className="p-4 rounded-none border border-[#530A0C] bg-[#530A0C]/5 text-[#530A0C] flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="bg-white p-8 rounded-none text-center border border-[#E0E0E0]">
                        <p className="text-[#747878] text-xs font-bold uppercase tracking-wider">Keranjang belanja Anda kosong.</p>
                        <Link href={route('storefront.home')} className="mt-4 inline-block px-6 py-2.5 bg-[#212121] text-white text-xs font-bold rounded-none uppercase tracking-wider">Belanja Sekarang</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN: MULTI-STEP FORMS */}
                        <div className="lg:col-span-8">
                            {checkoutStep === 1 && (
                                <form onSubmit={handleNextStep} className="bg-white p-6 rounded-none border border-[#E0E0E0] space-y-5">
                                    <h3 className="text-sm font-extrabold text-[#212121] border-b border-[#E0E0E0] pb-2 flex items-center gap-2 uppercase tracking-widest">
                                        <MapPin className="w-4 h-4 text-[#212121]" />
                                        <span>Alamat Pengiriman Penerima</span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Nama Penerima</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={buyerName}
                                                onChange={e => setBuyerName(e.target.value)}
                                                className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121]"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Nomor HP / WA</label>
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="Contoh: 0812XXXXXXXX"
                                                value={buyerPhone}
                                                onChange={e => setBuyerPhone(e.target.value)}
                                                className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121]"
                                            />
                                        </div>

                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Email Pembeli (Informasi Notifikasi)</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={buyerEmail}
                                                onChange={e => setBuyerEmail(e.target.value)}
                                                className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121]"
                                            />
                                        </div>

                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Alamat Lengkap</label>
                                            <textarea 
                                                rows="3"
                                                required
                                                placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, kecamatan..."
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] font-sans"
                                            />
                                        </div>

                                        {/* Province Selector */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Provinsi</label>
                                            <select
                                                required
                                                value={selectedProvinceId}
                                                onChange={handleProvinceChange}
                                                className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121]"
                                            >
                                                <option value="">Pilih Provinsi</option>
                                                {provinces.map(p => (
                                                    <option key={p.province_id} value={p.province_id}>{p.province}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* City Selector */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kota / Kabupaten</label>
                                            <select
                                                required
                                                disabled={!selectedProvinceId || loadingCities}
                                                value={selectedCityId}
                                                onChange={handleCityChange}
                                                className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] disabled:opacity-40"
                                            >
                                                <option value="">{loadingCities ? 'Memuat kota...' : 'Pilih Kota'}</option>
                                                {cities.map(c => (
                                                    <option key={c.city_id} value={c.city_id}>{c.type ? `${c.type} ${c.city_name}` : c.city_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Postal Code */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kode Pos</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={postalCode}
                                                onChange={e => setPostalCode(e.target.value)}
                                                className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121]"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-none text-xs font-bold bg-[#212121] hover:opacity-90 text-white transition-all uppercase tracking-wider"
                                    >
                                        <span>Pilih Metode Pengiriman</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            )}

                            {checkoutStep === 2 && (
                                <div className="space-y-6">
                                    {/* Step 2: Shipping rate calculator */}
                                    <div className="bg-white p-6 rounded-none border border-[#E0E0E0] space-y-4 text-xs">
                                        <h3 className="text-sm font-extrabold text-[#212121] border-b border-[#E0E0E0] pb-2 flex items-center gap-2 uppercase tracking-widest">
                                            <Truck className="w-4.5 h-4.5 text-[#212121]" />
                                            <span>Opsi Layanan Pengiriman (Raja Ongkir)</span>
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Pilih Ekspedisi</label>
                                                <select
                                                    value={selectedCourier}
                                                    onChange={e => setSelectedCourier(e.target.value)}
                                                    className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121]"
                                                >
                                                    {activeCouriers.map(courier => (
                                                        <option key={courier} value={courier}>{courier.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="bg-[#f9f9f9] p-3 rounded-none flex flex-col justify-center gap-1 text-[10px] border border-[#E0E0E0]">
                                                <span className="text-[#747878]">Tujuan: {selectedCityName}, {selectedProvinceName}</span>
                                                <span className="text-[#212121] font-bold">Total Berat: {(totalWeight / 1000).toFixed(2)} kg</span>
                                            </div>
                                        </div>

                                        {/* Rate options loading */}
                                        {loadingShipping ? (
                                            <div className="py-6 text-center text-[#747878] animate-pulse">
                                                Menghitung tarif ongkos kirim real-time...
                                            </div>
                                        ) : shippingServices.length === 0 ? (
                                            <div className="py-6 text-center text-[#747878]">
                                                Tidak ada layanan pengiriman aktif untuk kurir {selectedCourier.toUpperCase()}. Coba ganti kurir lain.
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {shippingServices.map((rate, idx) => {
                                                    const costValue = rate.cost[0].value;
                                                    const isChecked = selectedService === rate.service;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleServiceSelect(rate.service, costValue)}
                                                            className={`w-full flex items-center justify-between p-3.5 rounded-none border text-left transition-all ${
                                                                isChecked 
                                                                    ? 'border-[#212121] bg-[#f9f9f9] text-[#212121]' 
                                                                    : 'border-[#E0E0E0] bg-white text-[#747878] hover:text-[#212121] hover:border-[#212121]'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-4 h-4 rounded-none border flex items-center justify-center ${isChecked ? 'bg-[#212121] border-[#212121] text-white' : 'border-[#747878]'}`}>
                                                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-sm text-[#212121]">{selectedCourier.toUpperCase()} {rate.service}</span>
                                                                    <span className="text-[10px] text-[#747878] block">{rate.description} (Est. tiba: {rate.cost[0].etd || '-'} hari)</span>
                                                                </div>
                                                            </div>
                                                            <span className="font-extrabold text-sm text-[#530A0C]">{formatCurrency(costValue)}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 3: Payment */}
                                    <div className="bg-white p-6 rounded-none border border-[#E0E0E0] space-y-4 text-xs">
                                        <h3 className="text-sm font-bold text-[#212121] border-b border-[#E0E0E0] pb-2 flex items-center gap-2 uppercase tracking-widest">
                                            <CreditCard className="w-4.5 h-4.5 text-[#212121]" />
                                            <span>Metode Pembayaran</span>
                                        </h3>

                                        {/* Tabs for Payment Type */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('midtrans')}
                                                className={`py-3 px-4 border text-center font-bold uppercase tracking-wider text-[10px] transition-all flex flex-col items-center justify-center gap-1.5 ${
                                                    paymentMethod === 'midtrans'
                                                        ? 'border-[#212121] bg-[#212121] text-white'
                                                        : 'border-[#E0E0E0] bg-white text-[#747878] hover:border-[#212121] hover:text-[#212121]'
                                                }`}
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                <span>Pembayaran Otomatis</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('manual_transfer')}
                                                className={`py-3 px-4 border text-center font-bold uppercase tracking-wider text-[10px] transition-all flex flex-col items-center justify-center gap-1.5 ${
                                                    paymentMethod === 'manual_transfer'
                                                        ? 'border-[#212121] bg-[#212121] text-white'
                                                        : 'border-[#E0E0E0] bg-white text-[#747878] hover:border-[#212121] hover:text-[#212121]'
                                                }`}
                                            >
                                                <Building2 className="w-4 h-4" />
                                                <span>Transfer Bank Manual</span>
                                            </button>
                                        </div>

                                        {paymentMethod === 'midtrans' ? (
                                            <>
                                                {/* Payment method preview grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                                    {paymentMethods.map((method, idx) => (
                                                        <div key={idx} className="p-3 border border-[#E0E0E0] bg-[#f9f9f9] rounded-none flex flex-col items-center gap-1.5 text-center">
                                                            <method.icon className="w-5 h-5 text-[#212121]" />
                                                            <span className="font-bold text-[10px] text-[#212121] uppercase tracking-wider">{method.label}</span>
                                                            <span className="text-[9px] text-[#747878] leading-tight">{method.desc}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Security badge */}
                                                <div className="flex items-center gap-2 p-3 border border-[#E0E0E0] bg-[#f9f9f9] rounded-none text-[10px] text-[#747878]">
                                                    <Shield className="w-4 h-4 text-[#212121] flex-shrink-0" />
                                                    <span>Pembayaran diproses secara aman oleh <strong className="text-[#212121]">Midtrans</strong> — tersertifikasi PCI DSS. Data kartu tidak pernah menyentuh server iLook Fashion.</span>
                                                </div>

                                                <p className="text-[10px] text-[#747878] leading-relaxed">
                                                    Klik <strong className="text-[#212121]">"Bayar Sekarang"</strong> untuk melanjutkan ke halaman pembayaran Midtrans. Pilih metode pembayaran favorit Anda di popup yang muncul.
                                                </p>
                                            </>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-[11px] text-[#747878] font-bold leading-relaxed uppercase tracking-wider">
                                                    Pilih Rekening Tujuan Transfer:
                                                </p>
                                                {bankAccounts.length === 0 ? (
                                                    <div className="p-4 border border-dashed border-[#E0E0E0] text-center text-[#747878]">
                                                        Belum ada rekening transfer manual yang aktif. Silakan hubungi admin toko.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {bankAccounts.map((bank) => {
                                                            const isBankSelected = selectedBankAccountId === bank.id;
                                                            return (
                                                                <button
                                                                    key={bank.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedBankAccountId(bank.id)}
                                                                    className={`w-full flex items-center justify-between p-3.5 border rounded-none text-left transition-all ${
                                                                        isBankSelected
                                                                            ? 'border-[#212121] bg-[#f9f9f9] text-[#212121]'
                                                                            : 'border-[#E0E0E0] bg-white text-[#747878] hover:text-[#212121] hover:border-[#212121]'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-4 h-4 rounded-none border flex items-center justify-center ${isBankSelected ? 'bg-[#212121] border-[#212121] text-white' : 'border-[#747878]'}`}>
                                                                            {isBankSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-extrabold text-sm text-[#212121]">{bank.bank_name}</span>
                                                                            <span className="text-[10px] text-[#747878] block">No. Rek: <strong className="text-[#212121] font-mono">{bank.account_number}</strong> &nbsp;·&nbsp; a/n: {bank.account_holder}</span>
                                                                        </div>
                                                                    </div>
                                                                    <Building2 className="w-5 h-5 text-[#212121] opacity-40" />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-[#747878] leading-relaxed pt-1.5 border-t border-[#E0E0E0]">
                                                    Setelah membuat pesanan, silakan transfer ke rekening yang dipilih di atas lalu unggah bukti transfer di halaman detail pesanan. Admin akan memverifikasi pesanan Anda.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                onClick={() => setCheckoutStep(1)}
                                                disabled={isProcessing}
                                                className="px-5 py-3 rounded-none border border-[#E0E0E0] bg-white text-[#747878] hover:text-[#212121] hover:border-[#212121] text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                                            >
                                                Kembali ke Alamat
                                            </button>
                                            <button 
                                                onClick={handleSubmitCheckout}
                                                disabled={isProcessing || (paymentMethod === 'manual_transfer' && !selectedBankAccountId)}
                                                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-none text-xs font-extrabold bg-[#212121] hover:opacity-90 text-white transition-all uppercase tracking-widest disabled:opacity-50"
                                            >
                                                <span>{paymentLoading ? 'Menghubungkan...' : submittingOrder ? 'Memproses...' : paymentMethod === 'manual_transfer' ? 'Buat Pesanan (Transfer Manual)' : 'Bayar Sekarang'}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: ITEMS SUMMARY */}
                        <div className="lg:col-span-4 bg-white p-6 rounded-none border border-[#E0E0E0] space-y-4 text-xs text-[#747878]">
                            <h3 className="text-sm font-extrabold text-[#212121] border-b border-[#E0E0E0] pb-2 uppercase tracking-widest">Detail Pesanan</h3>
                            
                            {/* Products summary list */}
                            <div className="divide-y divide-[#E0E0E0] max-h-48 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.variant_id} className="py-2.5 flex items-center justify-between gap-3 text-[11px]">
                                        <div className="min-w-0">
                                            <span className="font-bold text-[#212121] block truncate uppercase tracking-wider">{item.product_name}</span>
                                            <span className="text-[#747878] block truncate">Varian: {item.variant_name} x {item.quantity}</span>
                                        </div>
                                        <span className="font-extrabold text-[#212121] flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Input Section */}
                            <div className="border-t border-[#E0E0E0] pt-4 pb-1 space-y-2">
                                <span className="text-[10px] text-[#747878] font-bold uppercase tracking-wider block">Kupon Diskon</span>
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-none">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-emerald-700" />
                                            <div>
                                                <span className="font-bold font-mono tracking-wider text-xs block">{appliedCoupon.code}</span>
                                                <span className="text-[9px] text-emerald-600 block">Kupon berhasil diterapkan (-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : formatCurrency(appliedCoupon.discount_amount)})</span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleRemoveCoupon}
                                            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="MASUKKAN KODE KUPON"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            className="flex-1 bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2 text-xs font-mono font-bold tracking-wider text-[#212121] placeholder:text-[#B0B0B0]"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={applyingCoupon || !couponCode}
                                            className="px-4 py-2 bg-[#212121] text-white hover:opacity-90 disabled:opacity-40 text-xs font-bold uppercase tracking-wider rounded-none flex items-center justify-center min-w-[70px]"
                                        >
                                            {applyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Gunakan'}
                                        </button>
                                    </form>
                                )}
                                {couponError && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{couponError}</span>
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-[#E0E0E0] pt-3 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-[#212121]">{formatCurrency(subtotal)}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-700 font-bold">
                                        <span>Potongan Kupon</span>
                                        <span>-{formatCurrency(couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span>Ongkos Kirim</span>
                                    <span className="font-bold text-[#212121]">{shippingCost > 0 ? formatCurrency(shippingCost) : 'Pilih layanan...'}</span>
                                </div>
                            </div>

                            <div className="border-t border-[#E0E0E0] pt-3 flex justify-between items-baseline">
                                <span className="text-[#212121] font-bold">Total Pembayaran</span>
                                <span className="text-base font-extrabold text-[#530A0C]">{formatCurrency(finalTotal)}</span>
                            </div>

                            {/* Powered by Midtrans badge */}
                            <div className="border-t border-[#E0E0E0] pt-3 flex items-center justify-center gap-1.5 text-[9px] text-[#747878]">
                                <Shield className="w-3 h-3" />
                                <span>Secured by <strong>Midtrans</strong></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
