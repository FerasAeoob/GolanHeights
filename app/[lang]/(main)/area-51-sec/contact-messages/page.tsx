import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import ContactMessagesClient from "@/components/admin/ContactMessagesClient";
import { ArrowLeft } from "lucide-react";

export default async function ContactMessagesAdminPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
        redirect(`/${lang}`);
    }

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 pt-24 md:pt-30">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <Link href={`/${lang}/area-51-sec`} className="hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium">
                                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                            </Link>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">Contact Messages</h1>
                        <p className="text-slate-500 text-sm md:text-base">Review and manage contact form submissions</p>
                    </div>
                </div>

                <ContactMessagesClient />
            </div>
        </div>
    );
}
