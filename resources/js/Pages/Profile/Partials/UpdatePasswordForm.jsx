import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '', isAdmin = false }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    if (isAdmin) {
        return (
            <section className={className}>
                <header className="border-b border-gray-100 pb-3 flex flex-col">
                    <h2 className="text-base font-bold text-gray-800 font-outfit">
                        Perbarui Kata Sandi
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.
                    </p>
                </header>

                <form onSubmit={updatePassword} className="mt-6 space-y-5">
                    <div>
                        <label htmlFor="current_password" className="text-xs font-semibold text-gray-400 uppercase">Kata Sandi Saat Ini</label>
                        <input
                            id="current_password"
                            type="password"
                            ref={currentPasswordInput}
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 mt-1"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            autoComplete="current-password"
                        />
                        {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase">Kata Sandi Baru</label>
                        <input
                            id="password"
                            type="password"
                            ref={passwordInput}
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 mt-1"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-400 uppercase">Konfirmasi Kata Sandi Baru</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 mt-1"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-semibold text-sm disabled:opacity-50"
                        >
                            Simpan Perubahan
                        </button>

                        {recentlySuccessful && (
                            <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                                Kata sandi berhasil diperbarui!
                            </span>
                        )}
                    </div>
                </form>
            </section>
        );
    }

    return (
        <section className={className}>
            <header className="border-b border-[#E0E0E0] pb-3 flex flex-col">
                <h2 className="text-sm font-extrabold tracking-wider text-[#212121] uppercase">
                    Perbarui Kata Sandi
                </h2>
                <p className="text-xs text-[#747878] mt-1">
                    Pastikan akun Anda menggunakan kata sandi yang aman dan tidak mudah ditebak.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="current_password" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kata Sandi Saat Ini</label>
                    <input
                        id="current_password"
                        type="password"
                        ref={currentPasswordInput}
                        className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                    />
                    {errors.current_password && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.current_password}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kata Sandi Baru</label>
                    <input
                        id="password"
                        type="password"
                        ref={passwordInput}
                        className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Konfirmasi Kata Sandi Baru</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                    />
                    {errors.password_confirmation && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 bg-[#212121] hover:bg-[#333333] text-white text-xs font-bold rounded-none uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        Simpan Perubahan
                    </button>

                    {recentlySuccessful && (
                        <span className="text-xs text-green-600 font-bold uppercase tracking-wider animate-pulse">
                            Kata sandi berhasil diperbarui!
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
