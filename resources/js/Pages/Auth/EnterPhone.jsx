import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { Phone, LogOut, ArrowRight, Loader2 } from 'lucide-react';

export default function EnterPhone() {
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('phone.store'));
    };

    return (
        <>
            <Head title="Lengkapi Nomor HP — iLook Fashion" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .ilook-phone-page {
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #f7f7f7;
                    color: #1a1a1a;
                }

                /* ── HEADER ── */
                .ilook-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    height: 56px;
                    background: #fff;
                    border-bottom: 1px solid #e8e8e8;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .ilook-header-logo {
                    font-size: 1.1rem;
                    font-weight: 900;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #1a1a1a;
                    text-decoration: none;
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                }

                /* ── MAIN ── */
                .ilook-main {
                    flex: 1;
                    display: flex;
                    align-items: stretch;
                    justify-content: center;
                    padding: 2.5rem 1.5rem;
                }
                .ilook-card {
                    display: flex;
                    width: 100%;
                    max-width: 820px;
                    min-height: 480px;
                    background: #fff;
                    box-shadow: 0 4px 40px rgba(0,0,0,0.08);
                    border-radius: 2px;
                    overflow: hidden;
                }

                /* ── LEFT PANEL ── */
                .ilook-panel-left {
                    flex: 0 0 45%;
                    position: relative;
                    background: linear-gradient(135deg, #2d1f14 0%, #c98a48 45%, #e8c080 70%, #f5d89a 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 2rem;
                    overflow: hidden;
                }
                .ilook-panel-left::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse at 30% 20%, rgba(255,220,130,0.35) 0%, transparent 55%),
                        radial-gradient(ellipse at 70% 80%, rgba(100,50,10,0.4) 0%, transparent 50%);
                }
                .ilook-panel-left-content {
                    position: relative;
                    z-index: 1;
                }
                .ilook-panel-tagline {
                    font-size: 1.55rem;
                    font-weight: 900;
                    line-height: 1.15;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                    color: #fff;
                    margin-bottom: 0.75rem;
                    text-shadow: 0 2px 12px rgba(0,0,0,0.25);
                }
                .ilook-panel-desc {
                    font-size: 0.72rem;
                    font-weight: 400;
                    color: rgba(255,255,255,0.75);
                    line-height: 1.6;
                    max-width: 220px;
                }

                /* ── RIGHT PANEL ── */
                .ilook-panel-right {
                    flex: 1;
                    padding: 2.5rem 2.25rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .ilook-form-title {
                    font-size: 1.35rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: #1a1a1a;
                    margin-bottom: 0.3rem;
                }
                .ilook-form-subtitle {
                    font-size: 0.78rem;
                    color: #888;
                    margin-bottom: 1.75rem;
                    font-weight: 400;
                    line-height: 1.4;
                }

                /* ── FORM FIELDS ── */
                .ilook-field {
                    margin-bottom: 1.5rem;
                }
                .ilook-label {
                    display: block;
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #555;
                    margin-bottom: 0.5rem;
                }
                .ilook-input-wrap {
                    position: relative;
                }
                .ilook-input {
                    width: 100%;
                    padding: 0.75rem 0.85rem;
                    padding-left: 2.5rem;
                    border: 1px solid #d8d8d8;
                    border-radius: 2px;
                    font-size: 0.85rem;
                    font-family: 'Inter', sans-serif;
                    color: #1a1a1a;
                    background: #fafafa;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .ilook-input::placeholder { color: #bbb; }
                .ilook-input:focus {
                    border-color: #1a1a1a;
                    background: #fff;
                    box-shadow: 0 0 0 2px rgba(26,26,26,0.06);
                }
                .ilook-input-icon {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #999;
                    width: 16px;
                    height: 16px;
                }

                /* ── BUTTONS ── */
                .ilook-btn-submit {
                    width: 100%;
                    padding: 0.85rem;
                    background: #1a1a1a;
                    color: #fff;
                    border: none;
                    border-radius: 2px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.1s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .ilook-btn-submit:hover:not(:disabled) {
                    background: #333;
                }
                .ilook-btn-submit:active:not(:disabled) {
                    transform: scale(0.98);
                }
                .ilook-btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .ilook-row-logout {
                    display: flex;
                    justify-content: center;
                    margin-top: 1.5rem;
                }
                .ilook-logout-link {
                    background: none;
                    border: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #888;
                    text-decoration: none;
                    cursor: pointer;
                    transition: color 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .ilook-logout-link:hover {
                    color: #b91c1c;
                }

                /* ── RESPONSIVE ── */
                @media (max-width: 768px) {
                    .ilook-card {
                        flex-direction: column;
                        max-width: 450px;
                        min-height: auto;
                    }
                    .ilook-panel-left {
                        display: none;
                    }
                    .ilook-panel-right {
                        padding: 2rem 1.5rem;
                    }
                }
            `}</style>

            <div className="ilook-phone-page">
                <header className="ilook-header">
                    <Link href="/" className="ilook-header-logo">ILOOK</Link>
                </header>

                <main className="ilook-main">
                    <div className="ilook-card">
                        {/* Left Panel */}
                        <div className="ilook-panel-left">
                            <div className="ilook-panel-left-content">
                                <h2 className="ilook-panel-tagline">
                                    Langkah<br />Terakhir.
                                </h2>
                                <p className="ilook-panel-desc">
                                    Nomor HP Anda digunakan untuk konfirmasi pesanan, kemudahan pengiriman, serta update resi otomatis.
                                </p>
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="ilook-panel-right">
                            <h1 className="ilook-form-title">Lengkapi Nomor HP</h1>
                            <p className="ilook-form-subtitle">
                                Silakan masukkan nomor handphone aktif Anda untuk menyelesaikan proses masuk ke akun belanja iLook.
                            </p>

                            <form onSubmit={submit}>
                                <div className="ilook-field">
                                    <label htmlFor="phone" className="ilook-label">Nomor Handphone</label>
                                    <div className="ilook-input-wrap">
                                        <Phone className="ilook-input-icon" />
                                        <input
                                            id="phone"
                                            type="text"
                                            className="ilook-input"
                                            placeholder="Contoh: 081234567890"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            required
                                            autoFocus
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <InputError message={errors.phone} className="mt-2 text-xs font-bold uppercase tracking-wider text-red-500" />
                                </div>

                                <button
                                    type="submit"
                                    className="ilook-btn-submit"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="animate-spin mr-1 animate-duration-1000" size={14} />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Simpan & Lanjutkan
                                            <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="ilook-row-logout">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="ilook-logout-link"
                                >
                                    <LogOut size={12} />
                                    Keluar / Logout
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
