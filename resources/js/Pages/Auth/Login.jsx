import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign In — iLook Fashion" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .ilook-login-page {
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
                    max-width: 200px;
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
                }

                /* Status banner */
                .ilook-status {
                    padding: 0.65rem 0.85rem;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    color: #15803d;
                    margin-bottom: 1.25rem;
                }

                /* ── FORM FIELDS ── */
                .ilook-field {
                    margin-bottom: 1.1rem;
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

                /* ── REMEMBER / FORGOT ── */
                .ilook-row-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.25rem;
                }
                .ilook-remember {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    cursor: pointer;
                }
                .ilook-remember input[type="checkbox"] {
                    width: 14px;
                    height: 14px;
                    accent-color: #1a1a1a;
                    cursor: pointer;
                }
                .ilook-remember span {
                    font-size: 0.76rem;
                    color: #666;
                    user-select: none;
                }
                .ilook-forgot {
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #888;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .ilook-forgot:hover { color: #1a1a1a; }

                /* ── SIGN IN BTN ── */
                .ilook-btn-signin {
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
                }
                .ilook-btn-signin:hover { background: #333; }
                .ilook-btn-signin:active { transform: scale(0.99); }
                .ilook-btn-signin:disabled { opacity: 0.6; cursor: not-allowed; }
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
                    margin: 1.1rem 0;
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

                /* ── SOCIAL BUTTONS ── */
                .ilook-social-row {
                    display: flex;
                    gap: 0.6rem;
                    margin-bottom: 1.25rem;
                }
                .ilook-social-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.6rem;
                    border: 1px solid #d8d8d8;
                    border-radius: 2px;
                    background: #fff;
                    font-size: 0.75rem;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    color: #555;
                    cursor: pointer;
                    transition: border-color 0.15s, background 0.15s;
                    text-decoration: none;
                }
                .ilook-social-btn:hover {
                    border-color: #aaa;
                    background: #f7f7f7;
                }

                /* ── REGISTER ── */
                .ilook-no-account {
                    font-size: 0.75rem;
                    color: #888;
                    text-align: center;
                    margin-bottom: 0.6rem;
                }
                .ilook-btn-register {
                    display: block;
                    width: 100%;
                    padding: 0.7rem;
                    border: 1.5px solid #1a1a1a;
                    border-radius: 2px;
                    background: transparent;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: #1a1a1a;
                    text-align: center;
                    text-decoration: none;
                    cursor: pointer;
                    transition: background 0.18s, color 0.18s;
                }
                .ilook-btn-register:hover {
                    background: #1a1a1a;
                    color: #fff;
                }

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

            <div className="ilook-login-page">

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
                                <p className="ilook-panel-tagline">
                                    Curated Style<br />for<br />Professionals
                                </p>
                                <p className="ilook-panel-desc">
                                    Join our community and access exclusive urban collections and professional wardrobe essentials.
                                </p>
                            </div>
                        </div>

                        {/* Right form panel */}
                        <div className="ilook-panel-right">
                            <h1 className="ilook-form-title">Welcome Back</h1>
                            <p className="ilook-form-subtitle">Please enter your details to sign in.</p>

                            {status && (
                                <div className="ilook-status">{status}</div>
                            )}

                            <form onSubmit={submit}>
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
                                            autoFocus
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1" style={{ fontSize: '0.72rem', color: '#dc2626' }} />
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
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
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
                                    <InputError message={errors.password} className="mt-1" style={{ fontSize: '0.72rem', color: '#dc2626' }} />
                                </div>

                                {/* Remember me + Forgot password */}
                                <div className="ilook-row-meta">
                                    <label className="ilook-remember">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="ilook-forgot">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                {/* Sign In button */}
                                <button type="submit" className="ilook-btn-signin" disabled={processing}>
                                    {processing ? <span className="ilook-spinner" /> : null}
                                    Sign In
                                </button>
                            </form>

                            {/* OR divider */}
                            <div className="ilook-or"><span>or continue with</span></div>

                            {/* Social buttons */}
                            <div className="ilook-social-row">
                                <a href={route('auth.google')} className="ilook-social-btn">
                                    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Google
                                </a>
                            </div>

                            {/* Create account */}
                            <p className="ilook-no-account">Don't have an account yet?</p>
                            <Link href={route('register')} className="ilook-btn-register">
                                Create New Account
                            </Link>
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
