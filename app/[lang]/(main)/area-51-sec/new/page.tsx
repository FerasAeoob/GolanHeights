import PlaceForm from "@/components/admin/PlaceForm";
import { getCurrentUser } from "@/lib/auth";
import { isOwner } from "@/lib/permissions";
import Link from "next/link";
import { getDictionary } from "@/lib/get-dictionary";

export default async function NewPlacePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    
    const user = await getCurrentUser();
    if (!isOwner(user)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center pt-30">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Not Allowed</h1>
                <p className="text-slate-600 mb-6">Only the site owner can add new places.</p>
                <Link href={`/${lang}/area-51-sec`} className="text-blue-600 hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const dict = await getDictionary(lang as "en" | "he" | "ar");
    return <PlaceForm mode="create" lang={lang} dict={dict} />;
}
