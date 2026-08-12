import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, MapPin, Loader2 } from 'lucide-react';

// react-leaflet's default marker icon paths break under Vite's asset
// bundling — point them at the CDN copies instead of local imports.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [-6.2088, 106.8456]; // Jakarta fallback

async function reverseGeocode(lat, lng) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error('Reverse geocoding failed');
    return res.json();
}

function ClickHandler({ onPick }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function FlyTo({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 16);
    }, [position]);
    return null;
}

export default function AddressMapPicker({ latitude, longitude, onLocationSelect }) {
    const [position, setPosition] = useState(
        latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : null
    );
    const [loading, setLoading] = useState(false);
    const [detectedAddress, setDetectedAddress] = useState('');
    const [error, setError] = useState('');
    const markerRef = useRef(null);

    const handleSetPosition = async (lat, lng) => {
        setPosition([lat, lng]);
        setLoading(true);
        setError('');
        try {
            const data = await reverseGeocode(lat, lng);
            const label = data.display_name || '';
            setDetectedAddress(label);
            onLocationSelect(lat, lng, label);
        } catch {
            setError('Gagal mendeteksi alamat dari lokasi ini. Koordinat tetap tersimpan.');
            onLocationSelect(lat, lng, '');
        } finally {
            setLoading(false);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Browser Anda tidak mendukung deteksi lokasi.');
            return;
        }
        setLoading(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handleSetPosition(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                setLoading(false);
                setError('Tidak bisa mengambil lokasi. Pastikan izin lokasi diaktifkan, atau pilih lokasi manual di peta.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] text-[#747878] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Titik Lokasi di Peta (opsional)
                </label>
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#212121] border border-[#E0E0E0] px-3 py-1.5 hover:border-[#212121] transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                    Gunakan Lokasi Saya
                </button>
            </div>

            {/* isolate: Leaflet's panes/controls use z-index values (400–1000)
                that otherwise leak above the site's sticky header — this
                creates a new stacking context so they stay contained here. */}
            <div className="w-full h-[280px] border border-[#E0E0E0] overflow-hidden relative isolate z-0">
                <MapContainer
                    center={position || DEFAULT_CENTER}
                    zoom={position ? 16 : 11}
                    style={{ width: '100%', height: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickHandler onPick={handleSetPosition} />
                    <FlyTo position={position} />
                    {position && (
                        <Marker
                            position={position}
                            draggable
                            ref={markerRef}
                            eventHandlers={{
                                dragend: () => {
                                    const m = markerRef.current;
                                    if (m) {
                                        const { lat, lng } = m.getLatLng();
                                        handleSetPosition(lat, lng);
                                    }
                                },
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            <p className="text-[10px] text-[#747878] leading-relaxed">
                Klik di peta atau geser pin untuk menandai lokasi persis — alamat lengkap akan terisi otomatis. Bisa diedit manual setelahnya.
            </p>

            {detectedAddress && !loading && (
                <p className="text-[10px] text-[#212121] bg-gray-50 border border-[#E0E0E0] p-2">
                    <span className="font-bold uppercase tracking-wider">Terdeteksi: </span>
                    {detectedAddress}
                </p>
            )}
            {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>
    );
}
