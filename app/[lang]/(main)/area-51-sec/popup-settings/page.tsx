import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSettings } from "@/lib/db/settings";
import { getPlaces } from "@/lib/db/places";
import PopupSettingsClient from "@/components/admin/PopupSettingsClient";

export default async function PopupSettingsAdminPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
        redirect(`/${lang}`);
    }

    const [settings, places] = await Promise.all([
        getSettings(),
        getPlaces(),
    ]);

    return (
        <div className="p-4 md:p-8 pb-16 md:pb-24 bg-slate-50 min-h-screen text-slate-900 pt-24 md:pt-30">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-2 mb-8">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Link href={`/${lang}/area-51-sec`} className="hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Special Place Popup</h1>
                    <p className="text-slate-500 text-sm md:text-base">Configure the featured location card displayed on the homepage</p>
                </div>

                <PopupSettingsClient
                    initialSettings={settings}
                    places={places}
                    lang={lang}
                />
            </div>
        </div>
    );
}
