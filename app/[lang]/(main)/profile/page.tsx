import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/get-dictionary";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileForm from "@/components/profile/EditProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import AvatarUploader from "@/components/profile/AvatarUploader";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { LogOut, Heart, MapPin, Mail, Phone as PhoneIcon } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Profile — Golan Heights Guide",
    description: "Manage your profile, update your information, and change your password.",
};

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const locale = lang as Locale;

    const [dict, currentUser] = await Promise.all([
        getDictionary(locale),
        getCurrentUser(),
    ]);

    const p = dict?.profile || {};

    // Unauthenticated state
    if (!currentUser) {
        return (
            <section className="lg:max-w-[1400px] max-w-[1200px] mt-35 mx-auto px-4">
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                        <Mail size={32} className="text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            {p?.title || "My Profile"}
                        </h1>
                        <p className="text-slate-500 text-lg">
                            {p?.loginRequired || "Please log in to view your profile."}
                        </p>
                    </div>
                    <Link
                        href={`/${lang}/login`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-lg shadow-emerald-600/20"
                    >
                        {dict?.auth?.login || "Login"}
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="lg:max-w-[1400px] max-w-[1200px] mt-35 mx-auto px-4 pb-20">
            <Suspense fallback={<ProfileSkeleton />}>
                {/* Profile Header Card */}
                <ProfileHeader user={currentUser} dict={dict} lang={lang} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        {/* Avatar Management */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6">
                            <AvatarUploader
                                currentImage={currentUser.image}
                                name={currentUser.name}
                                email={currentUser.email}
                                dict={dict}
                            />
                        </div>

                        {/* Quick Info Card */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                {p?.personalInfo || "Info"}
                            </h3>

                            <div className="space-y-3">
                                {currentUser.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                            <Mail size={14} />
                                        </div>
                                        <span className="text-slate-600 truncate">{currentUser.email}</span>
                                    </div>
                                )}
                                {currentUser.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                            <PhoneIcon size={14} />
                                        </div>
                                        <span className="text-slate-600" dir="ltr">{currentUser.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                                        <Heart size={14} />
                                    </div>
                                    <span className="text-slate-600">
                                        {currentUser.favorites?.length || 0} {dict?.favoritesPage?.title || "favorites"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logout */}
                        <LogoutButton lang={lang} dict={dict} />
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Edit Profile Form */}
                        <EditProfileForm user={currentUser} dict={dict} />

                        {/* Change Password Form */}
                        <ChangePasswordForm dict={dict} />
                    </div>
                </div>
            </Suspense>
        </section>
    );
}

/** Logout button — tiny client island */
function LogoutButton({ lang, dict }: { lang: string; dict: Record<string, any> }) {
    const p = dict?.profile || {};
    return (
        <form action="/api/auth/logout" method="POST">
            <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200/80 text-red-500 hover:bg-red-50 hover:border-red-300 font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-[0.97]"
            >
                <LogOut size={16} />
                {p?.logout || "Log Out"}
            </button>
        </form>
    );
}