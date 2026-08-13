import { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import AddressMapPicker from '@/Components/AddressMapPicker';

export default function UpdateShippingForm({ provinces = [], className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        address: user.address || '',
        kelurahan: user.kelurahan || '',
        kecamatan: user.kecamatan || '',
        rajaongkir_province_id: user.rajaongkir_province_id || '',
        province: user.province || '',
        rajaongkir_city_id: user.rajaongkir_city_id || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        latitude: user.latitude || '',
        longitude: user.longitude || '',
    });

    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    // Track whether the city list load below was triggered by the user
    // picking a new province (should reset the city) vs. the initial load
    // for a province the user already had saved (should keep it selected).
    const [hasMountedCities, setHasMountedCities] = useState(false);

    useEffect(() => {
        if (!data.rajaongkir_province_id) {
            setCities([]);
            return;
        }

        const loadCities = async () => {
            setLoadingCities(true);
            try {
                const res = await axios.get(`/api/shipping/cities/${data.rajaongkir_province_id}`);
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
        // Only clear the previously-saved city when the province is
        // actively changed by the user, not on the initial mount.
        if (hasMountedCities) {
            setData((prev) => ({ ...prev, rajaongkir_city_id: '', city: '' }));
        }
        setHasMountedCities(true);
    }, [data.rajaongkir_province_id]);

    const handleProvinceChange = (e) => {
        const provId = e.target.value;
        const provObj = provinces.find((p) => p.province_id == provId);
        setData((prev) => ({ ...prev, rajaongkir_province_id: provId, province: provObj ? provObj.province : '' }));
    };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        const cityObj = cities.find((c) => c.city_id == cityId);
        setData((prev) => ({
            ...prev,
            rajaongkir_city_id: cityId,
            city: cityObj ? (cityObj.type ? `${cityObj.type} ${cityObj.city_name}` : cityObj.city_name) : '',
        }));
    };

    const handleMapLocationSelect = (lat, lng, addressText) => {
        setData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: addressText || prev.address,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.shipping.update'), { preserveScroll: true });
    };

    return (
        <section className={className}>
            <header className="border-b border-[#E0E0E0] pb-3 flex flex-col">
                <h2 className="text-sm font-extrabold tracking-wider text-[#212121] uppercase">
                    Alamat Pengiriman
                </h2>
                <p className="text-xs text-[#747878] mt-1">
                    Simpan alamat pengiriman utama Anda di sini.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <AddressMapPicker
                    latitude={data.latitude}
                    longitude={data.longitude}
                    onLocationSelect={handleMapLocationSelect}
                />

                <div>
                    <label htmlFor="address" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea
                        id="address"
                        rows="3"
                        required
                        placeholder="Tuliskan nama jalan, nomor rumah, RT/RW..."
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1 font-sans"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="kelurahan" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kelurahan / Desa</label>
                        <input
                            id="kelurahan"
                            type="text"
                            required
                            placeholder="Contoh: Kebon Jeruk"
                            value={data.kelurahan}
                            onChange={(e) => setData('kelurahan', e.target.value)}
                            className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        />
                        {errors.kelurahan && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.kelurahan}</p>}
                    </div>

                    <div>
                        <label htmlFor="kecamatan" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kecamatan</label>
                        <input
                            id="kecamatan"
                            type="text"
                            required
                            placeholder="Contoh: Kebon Jeruk"
                            value={data.kecamatan}
                            onChange={(e) => setData('kecamatan', e.target.value)}
                            className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        />
                        {errors.kecamatan && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.kecamatan}</p>}
                    </div>

                    <div>
                        <label htmlFor="province" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Provinsi</label>
                        <select
                            id="province"
                            required
                            value={data.rajaongkir_province_id}
                            onChange={handleProvinceChange}
                            className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        >
                            <option value="">Pilih Provinsi</option>
                            {provinces.map((p) => (
                                <option key={p.province_id} value={p.province_id}>{p.province}</option>
                            ))}
                        </select>
                        {errors.rajaongkir_province_id && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.rajaongkir_province_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="city" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kota / Kabupaten</label>
                        <select
                            id="city"
                            required
                            disabled={!data.rajaongkir_province_id || loadingCities}
                            value={data.rajaongkir_city_id}
                            onChange={handleCityChange}
                            className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1 disabled:opacity-40"
                        >
                            <option value="">{loadingCities ? 'Memuat kota...' : 'Pilih Kota'}</option>
                            {cities.map((c) => (
                                <option key={c.city_id} value={c.city_id}>{c.type ? `${c.type} ${c.city_name}` : c.city_name}</option>
                            ))}
                        </select>
                        {errors.rajaongkir_city_id && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.rajaongkir_city_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="postal_code" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kode Pos</label>
                        <input
                            id="postal_code"
                            type="text"
                            required
                            value={data.postal_code}
                            onChange={(e) => setData('postal_code', e.target.value)}
                            className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        />
                        {errors.postal_code && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.postal_code}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 bg-[#212121] hover:bg-[#333333] text-white text-xs font-bold rounded-none uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        Simpan Alamat
                    </button>

                    {recentlySuccessful && (
                        <span className="text-xs text-green-600 font-bold uppercase tracking-wider animate-pulse">
                            Alamat berhasil disimpan!
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
