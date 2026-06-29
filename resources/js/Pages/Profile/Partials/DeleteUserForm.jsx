import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '', isAdmin = false }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    if (isAdmin) {
        return (
            <section className={`space-y-6 ${className}`}>
                <header className="border-b border-gray-100 pb-3 flex flex-col">
                    <h2 className="text-base font-bold text-red-600 font-outfit">
                        Hapus Akun
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen.
                    </p>
                </header>

                <button
                    onClick={confirmUserDeletion}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-semibold text-sm"
                >
                    Hapus Akun Saya
                </button>

                <Modal show={confirmingUserDeletion} onClose={closeModal}>
                    <form onSubmit={deleteUser} className="p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-800 font-outfit">
                            Apakah Anda yakin ingin menghapus akun Anda?
                        </h2>

                        <p className="text-gray-500 text-sm leading-relaxed">
                            Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Silakan masukkan kata sandi Anda untuk mengonfirmasi tindakan ini.
                        </p>

                        <div>
                            <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase">Kata Sandi</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl px-4 py-2.5 text-gray-800 mt-1"
                                placeholder="Masukkan kata sandi Anda"
                                required
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold text-sm"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-semibold text-sm disabled:opacity-50"
                            >
                                Hapus Akun
                            </button>
                        </div>
                    </form>
                </Modal>
            </section>
        );
    }

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="border-b border-[#E0E0E0] pb-3 flex flex-col">
                <h2 className="text-sm font-extrabold tracking-wider text-[#530A0C] uppercase">
                    Hapus Akun
                </h2>
                <p className="text-xs text-[#747878] mt-1">
                    Setelah akun Anda dihapus, semua data belanja dan pesanan Anda akan terhapus secara permanen.
                </p>
            </header>

            <button
                onClick={confirmUserDeletion}
                className="px-6 py-3 bg-[#530A0C] hover:bg-[#7a1316] text-white text-xs font-bold rounded-none uppercase tracking-wider transition-colors mt-6"
            >
                Hapus Akun Saya
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-8 space-y-4">
                    <h2 className="text-sm font-extrabold tracking-wider text-[#212121] uppercase border-b border-[#E0E0E0] pb-2">
                        Konfirmasi Hapus Akun
                    </h2>

                    <p className="text-xs text-[#747878] leading-relaxed">
                        Tindakan ini tidak dapat dibatalkan. Seluruh data belanja, profil, dan riwayat pesanan Anda akan dihapus secara permanen. Silakan masukkan kata sandi untuk melanjutkan.
                    </p>

                    <div>
                        <label htmlFor="password" className="text-[10px] text-[#747878] font-bold uppercase tracking-wider">Kata Sandi</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-white border border-[#E0E0E0] focus:border-[#212121] focus:ring-0 rounded-none p-2.5 text-[#212121] text-xs mt-1"
                            placeholder="Password Anda"
                            required
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1 font-bold uppercase tracking-wider">{errors.password}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0] mt-6">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-2.5 bg-white border border-[#E0E0E0] hover:bg-[#f9f9f9] text-[#212121] text-xs font-bold rounded-none uppercase tracking-wider transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-[#530A0C] hover:bg-[#7a1316] text-white text-xs font-bold rounded-none uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            Hapus Akun
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
