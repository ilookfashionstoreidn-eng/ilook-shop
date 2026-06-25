import AdminLayout from '@/Layouts/AdminLayout';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    if (isAdmin) {
        return (
            <AdminLayout>
                <Head title="Profil Saya - Admin Panel" />

                <div className="flex flex-col gap-6 max-w-4xl">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-outfit">Profil Saya</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Kelola informasi pribadi, email, dan kata sandi akun administrator Anda.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="admin-card p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                                isAdmin={true}
                            />
                        </div>

                        <div className="admin-card p-6">
                            <UpdatePasswordForm className="max-w-xl" isAdmin={true} />
                        </div>

                        <div className="admin-card p-6">
                            <DeleteUserForm className="max-w-xl" isAdmin={true} />
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <StorefrontLayout>
            <Head title="Profil Saya - iLook Fashion" />

            <div className="px-4 sm:px-10 py-10 max-w-[800px] mx-auto space-y-8">
                {/* Header */}
                <div className="border-b border-[#E0E0E0] pb-4">
                    <h1 className="text-xl font-extrabold tracking-widest text-[#212121] uppercase">Profil Saya</h1>
                    <p className="text-[#747878] text-xs mt-0.5">Perbarui informasi profil dan kata sandi akun Anda.</p>
                </div>

                <div className="space-y-8">
                    <div className="bg-white border border-[#E0E0E0] p-6 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                            isAdmin={false}
                        />
                    </div>

                    <div className="bg-white border border-[#E0E0E0] p-6 sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" isAdmin={false} />
                    </div>

                    <div className="bg-white border border-[#E0E0E0] p-6 sm:p-8">
                        <DeleteUserForm className="max-w-xl" isAdmin={false} />
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
