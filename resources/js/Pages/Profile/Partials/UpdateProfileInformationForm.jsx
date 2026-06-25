import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
    isAdmin = false,
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    if (isAdmin) {
        return (
            <section className={className}>
                <header className="border-b border-gray-100 pb-3 flex flex-col">
                    <h2 className="text-base font-bold text-gray-800 font-outfit">
                        Informasi Profil
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Perbarui nama dan alamat email akun administrator Anda.
                    </p>
                </header>

                <form onSubmit={submit} className="mt-6 space-y-5">
                    <div>
                        <label htmlFor="name" className="text-xs font-semibold text-gray-400 uppercase">Nama Lengkap</label>
                        <input
                            id="name"
                            type="text"
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 mt-1"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase">Alamat Email</label>
                        <input
                            id="email"
                            type="email"
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 mt-1"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="text-xs font-semibold text-gray-400 uppercase">Nomor HP</label>
                        <input
                            id="phone"
                            type="text"
                            className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 mt-1"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                            placeholder="Contoh: 081234567890"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="text-xs mt-2">
                            <p className="text-gray-800">
                                Alamat email Anda belum terverifikasi.
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="ml-1 text-emerald-600 underline hover:text-emerald-700 font-semibold"
                                >
                                    Klik di sini untuk mengirim ulang email verifikasi.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-1 font-semibold text-emerald-600">
                                    Tautan verifikasi baru telah dikirim ke alamat email Anda.
                                </div>
                            )}
                        </div>
                    )}

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
                                Profil berhasil disimpan!
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
                    Informasi Profil
                </h2>
                <p className="text-xs text-[#747878] mt-1">
                    Perbarui nama dan alamat email akun belanja Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="name" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Nama Lengkap</label>
                    <input
                        id="name"
                        type="text"
                        className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Alamat Email</label>
                    <input
                        id="email"
                        type="email"
                        className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="phone" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Nomor HP</label>
                    <input
                        id="phone"
                        type="text"
                        className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                        autoComplete="tel"
                        placeholder="Contoh: 081234567890"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.phone}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="text-xs mt-2">
                        <p className="text-[#747878]">
                            Alamat email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 text-[#212121] underline hover:opacity-75 font-bold uppercase tracking-wider"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-1 font-bold uppercase tracking-wider text-green-600">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

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
                            Profil berhasil disimpan!
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
