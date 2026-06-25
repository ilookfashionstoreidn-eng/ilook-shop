import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Create Account — iLook Fashion" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .ilook-reg-page {
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
                .ilook-header-menu-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 4px;
                }
                .ilook-header-menu-btn span {
                    display: block;
                    width: 20px;
                    height: 2px;
                    background: #1a1a1a;
                    border-radius: 2px;
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
                .ilook-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .ilook-header-actions a {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #1a1a1a;
                    text-decoration: none;
                }
                .ilook-header-cart {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a1a1a;
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
                    background: #fff;
                    box-shadow: 0 4px 40px rgba(0,0,0,0.08);
                    border-radius: 2px;
                    overflow: hidden;
                }

                /* ── LEFT PANEL ── */
                .ilook-panel-left {
                    flex: 0 0 40%;
                    position: relative;
                    background: linear-gradient(160deg, #1a1a2e 0%, #3d2b1f 30%, #c98a48 65%, #f0d090 100%);
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
                        radial-gradient(ellipse at 25% 15%, rgba(255,215,100,0.3) 0%, transparent 55%),
                        radial-gradient(ellipse at 75% 85%, rgba(80,30,5,0.45) 0%, transparent 50%);
                }
                /* Decorative ring */
                .ilook-panel-left::after {
                    content: '';
                    position: absolute;
                    top: -60px;
                    right: -60px;
                    width: 220px;
                    height: 220px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .ilook-panel-left-content {
                    position: relative;
                    z-index: 1;
                }
                .ilook-panel-badge {
                    display: inline-block;
                    padding: 0.3rem 0.7rem;
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 20px;
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.7);
                    margin-bottom: 0.85rem;
                }
                .ilook-panel-tagline {
                    font-size: 1.5rem;
                    font-weight: 900;
                    line-height: 1.15;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                    color: #fff;
                    margin-bottom: 0.75rem;
                    text-shadow: 0 2px 12px rgba(0,0,0,0.3);
                }
                .ilook-panel-desc {
                    font-size: 0.72rem;
                    font-weight: 400;
                    color: rgba(255,255,255,0.7);
                    line-height: 1.65;
                    max-width: 210px;
                }
                .ilook-panel-perks {
                    margin-top: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .ilook-panel-perk {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.68rem;
                    color: rgba(255,255,255,0.75);
                    font-weight: 500;
                }
                .ilook-panel-perk svg {
                    flex-shrink: 0;
                    opacity: 0.9;
                }

                /* ── RIGHT PANEL ── */
                .ilook-panel-right {
                    flex: 1;
                    padding: 2.25rem 2.25rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    overflow-y: auto;
                }
                .ilook-form-title {
                    font-size: 1.3rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: #1a1a1a;
                    margin-bottom: 0.3rem;
                }
                .ilook-form-subtitle {
                    font-size: 0.78rem;
                    color: #888;
                    margin-bottom: 1.5rem;
                    font-weight: 400;
                }

                /* ── FORM FIELDS ── */
                .ilook-field {
                    margin-bottom: 1rem;
                }
                .ilook-label {
                    display: block;
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #555;
                    margin-bottom: 0.4rem;
                }
                .ilook-input-wrap {
                    position: relative;
                }
                .ilook-input {
                    width: 100%;
                    padding: 0.65rem 0.85rem;
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
                .ilook-input-pw { padding-right: 2.5rem; }
                .ilook-pw-toggle {
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #aaa;
                    display: flex;
                    align-items: center;
                    padding: 0;
                    transition: color 0.15s;
                }
                .ilook-pw-toggle:hover { color: #555; }
                .ilook-error {
                    margin-top: 0.3rem;
                    font-size: 0.7rem;
                    color: #dc2626;
                }

                /* ── SUBMIT BTN ── */
                .ilook-btn-submit {
                    width: 100%;
                    padding: 0.8rem;
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
                    margin-bottom: 1.1rem;
                }
                .ilook-btn-submit:hover { background: #333; }
                .ilook-btn-submit:active { transform: scale(0.99); }
                .ilook-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .ilook-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── DIVIDER ── */
                .ilook-or {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .ilook-or::before, .ilook-or::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e8e8e8;
                }
                .ilook-or span {
                    font-size: 0.68rem;
                    font-weight: 500;
                    color: #bbb;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                /* ── LOGIN LINK ── */
                .ilook-signin-row {
                    text-align: center;
                    font-size: 0.75rem;
                    color: #888;
                }
                .ilook-signin-link {
                    font-weight: 700;
                    color: #1a1a1a;
                    text-decoration: none;
                    letter-spacing: 0.04em;
                    border-bottom: 1px solid #1a1a1a;
                    padding-bottom: 1px;
                    transition: opacity 0.15s;
                }
                .ilook-signin-link:hover { opacity: 0.65; }

                /* ── TERMS NOTE ── */
                .ilook-terms {
                    font-size: 0.65rem;
                    color: #aaa;
                    text-align: center;
                    line-height: 1.55;
                    margin-top: 0.85rem;
                }
                .ilook-terms a {
                    color: #888;
                    text-decoration: underline;
                }
                .ilook-terms a:hover { color: #1a1a1a; }

                /* ── FOOTER ── */
                .ilook-footer {
                    background: #fff;
                    border-top: 1px solid #e8e8e8;
                    padding: 1.5rem 2rem;
                    text-align: center;
                }
                .ilook-footer-brand {
                    font-size: 0.9rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    color: #1a1a1a;
                    margin-bottom: 0.85rem;
                }
                .ilook-footer-links {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 0.25rem 0.9rem;
                    margin-bottom: 0.75rem;
                }
                .ilook-footer-links a {
                    font-size: 0.62rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #888;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .ilook-footer-links a:hover { color: #1a1a1a; }
                .ilook-footer-copy {
                    font-size: 0.6rem;
                    color: #bbb;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                /* ── RESPONSIVE ── */
                @media (max-width: 640px) {
                    .ilook-panel-left { display: none; }
                    .ilook-main { padding: 1.5rem 1rem; }
                    .ilook-panel-right { padding: 2rem 1.5rem; }
                }
            `}</style>

            <div className="ilook-reg-page">

                {/* ── HEADER ── */}
                <header className="ilook-header">
                    <button className="ilook-header-menu-btn" aria-label="Menu">
                        <span /><span /><span />
                    </button>

                    <Link href={route('storefront.home')} className="ilook-header-logo">
                        iLook Fashion
                    </Link>

                    <div className="ilook-header-actions">
                        <a href="#">Search</a>
                        <Link href={route('storefront.cart')} className="ilook-header-cart" aria-label="Cart">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                        </Link>
                    </div>
                </header>

                {/* ── MAIN CARD ── */}
                <main className="ilook-main">
                    <div className="ilook-card">

                        {/* Left gradient panel */}
                        <div className="ilook-panel-left">
                            <div className="ilook-panel-left-content">
                                <span className="ilook-panel-badge">New Member</span>
                                <p className="ilook-panel-tagline">
                                    Start Your<br />Style<br />Journey
                                </p>
                                <p className="ilook-panel-desc">
                                    Create an account and unlock exclusive access to our curated fashion collections.
                                </p>
                                <div className="ilook-panel-perks">
                                    <div className="ilook-panel-perk">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        Early access to new collections
                                    </div>
                                    <div className="ilook-panel-perk">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        Track orders in real time
                                    </div>
                                    <div className="ilook-panel-perk">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        Exclusive member discounts
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right form panel */}
                        <div className="ilook-panel-right">
                            <h1 className="ilook-form-title">Create Account</h1>
                            <p className="ilook-form-subtitle">Fill in your details to get started.</p>

                            <form onSubmit={submit}>
                                {/* Name */}
                                <div className="ilook-field">
                                    <label htmlFor="name" className="ilook-label">Full Name</label>
                                    <div className="ilook-input-wrap">
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="ilook-input"
                                            placeholder="Your full name"
                                            autoComplete="name"
                                            autoFocus
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="ilook-error">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className="ilook-field">
                                    <label htmlFor="email" className="ilook-label">Email Address</label>
                                    <div className="ilook-input-wrap">
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="ilook-input"
                                            placeholder="your@email.com"
                                            autoComplete="username"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="ilook-error">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="ilook-field">
                                    <label htmlFor="password" className="ilook-label">Password</label>
                                    <div className="ilook-input-wrap">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            className="ilook-input ilook-input-pw"
                                            placeholder="Min. 8 characters"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="ilook-pw-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="ilook-error">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div className="ilook-field">
                                    <label htmlFor="password_confirmation" className="ilook-label">Confirm Password</label>
                                    <div className="ilook-input-wrap">
                                        <input
                                            id="password_confirmation"
                                            type={showConfirm ? 'text' : 'password'}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="ilook-input ilook-input-pw"
                                            placeholder="Re-enter your password"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="ilook-pw-toggle"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                        >
                                            {showConfirm ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="ilook-error">{errors.password_confirmation}</p>}
                                </div>

                                {/* Submit */}
                                <button type="submit" className="ilook-btn-submit" disabled={processing}>
                                    {processing ? <span className="ilook-spinner" /> : null}
                                    Create Account
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="ilook-or"><span>already have an account?</span></div>

                            {/* Sign in link */}
                            <p className="ilook-signin-row">
                                <Link href={route('login')} className="ilook-signin-link">
                                    Sign In Here
                                </Link>
                            </p>

                            {/* Terms note */}
                            <p className="ilook-terms">
                                By creating an account you agree to our{' '}
                                <a href="#">Terms of Service</a> and{' '}
                                <a href="#">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </main>

                {/* ── FOOTER ── */}
                <footer className="ilook-footer">
                    <p className="ilook-footer-brand">iLook Fashion</p>
                    <nav className="ilook-footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Store Location</a>
                        <a href="#">Contact Us</a>
                        <a href="#">Shipping &amp; Returns</a>
                    </nav>
                    <p className="ilook-footer-copy">© {new Date().getFullYear()} iLook Fashion. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
