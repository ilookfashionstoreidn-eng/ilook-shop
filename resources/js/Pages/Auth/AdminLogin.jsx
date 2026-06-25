import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, ArrowLeft, Shield } from 'lucide-react';
import InputError from '@/Components/InputError';

export default function AdminLogin({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.login'));
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-center items-center relative overflow-hidden px-4 font-sans selection:bg-emerald-500 selection:text-white">
            <Head title="Admin Login — iLook Admin" />

            {/* Subtle background decoration matching light admin layout */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Back to store link */}
            <div className="absolute top-8 left-8 z-10">
                <Link
                    href={route('storefront.home')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Toko</span>
                </Link>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-10 transition-all duration-300 hover:shadow-2xl">
                {/* Admin Hero Header */}
                <div className="admin-hero text-white p-8 text-center flex flex-col items-center justify-center relative !rounded-t-2xl !rounded-b-none border-b border-gray-100">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 border border-white/20 rounded-2xl mb-3 backdrop-blur-sm shadow-inner">
                        <Shield className="w-7 h-7 text-emerald-450" />
                    </div>
                    <h1 className="text-2xl font-black tracking-[0.25em] text-white uppercase mb-1 font-outfit">
                        iLOOK
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.25em] text-blue-200 uppercase">
                        Admin Portal
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    {status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-200"
                                    placeholder="admin@ilookfashion.com"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2 text-xs text-red-500 font-semibold" />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-200"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2 text-xs text-red-500 font-semibold" />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 bg-white border border-gray-200 rounded text-emerald-600 focus:ring-0 focus:ring-offset-0 focus:ring-offset-transparent transition-all"
                                />
                                <span className="ml-2.5 text-xs text-gray-400 font-semibold select-none hover:text-gray-600 transition-colors">
                                    Ingat saya di perangkat ini
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span>Masuk ke Dashboard</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Fine print footer */}
            <div className="mt-8 text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                © {new Date().getFullYear()} iLOOK FASHION. SECURED ACCESS.
            </div>
        </div>
    );
}
