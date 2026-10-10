import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/permissions";
import { getDictionary, type Locale } from "@/lib/get-dictionary";
import { getLocalizedPathname } from "@/utils/navigation";
import { getPlaceOrderAction } from "@/app/actions/place-order";
import PlaceOrderEditor from "@/components/admin/PlaceOrderEditor";

export default async function PlaceOrderPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    try { await requireRole(["admin"]); }
    catch { redirect(getLocalizedPathname("/", lang)); }
    const [dictionary, result] = await Promise.all([getDictionary(lang), getPlaceOrderAction()]);
    const t = dictionary.placeOrder;
    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-16 pt-24 text-slate-900 md:p-8 md:pb-24 md:pt-30">
            <div className="mx-auto max-w-4xl">
                <Link href={getLocalizedPathname("/area-51-sec", lang)} className="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-blue-600 hover:underline">{t.back}</Link>
                <h1 className="text-2xl font-bold md:text-3xl">{t.title}</h1>
                <p className="mb-6 mt-2 text-sm text-slate-600 md:text-base">{t.description}</p>
                {"errorCode" in result ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{t.loadFailed}</p> : <PlaceOrderEditor initialPlaces={result.places} initialRevision={result.revision} lang={lang} dictionary={t} />}
            </div>
        </div>
    );
}
