import { getAdminPlaces } from "@/lib/db/admin-places";
import AdminButton from "@/components/admin/AdminButton";
import AdminPlaceSearch from "@/components/admin/AdminPlaceSearch";
import { deletePlaceAction, toggleFeaturedAction, toggleVisibilityAction } from "@/app/actions/places";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isOwner, isAdmin } from "@/lib/permissions";
import { getDictionary, type Locale } from "@/lib/get-dictionary";
import { getLocalizedPathname } from "@/utils/navigation";
import type { AdminPlaceSearchParams } from "@/lib/admin-place-search";

export default async function AdminDashboard({ params, searchParams }: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<AdminPlaceSearchParams>;
}) {
    const { lang } = await params;
    const locale = lang as Locale;

    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
        redirect(`/${lang}`);
    }

    const canAdd = isOwner(user);
    const canDelete = isOwner(user);

    const resolvedSearchParams = await searchParams;
    const [{ places, total, page, pageCount, query, invalid }, dictionary] = await Promise.all([
        getAdminPlaces(resolvedSearchParams),
        getDictionary(locale),
    ]);
    const labels = dictionary.adminPlaceSearch;
    function pageHref(targetPage: number) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(resolvedSearchParams)) {
            if (key === "page" || value === undefined) continue;
            for (const item of Array.isArray(value) ? value : [value]) queryParams.append(key, item);
        }
        if (targetPage > 1) queryParams.set("page", String(targetPage));
        return getLocalizedPathname("/area-51-sec", locale, queryParams);
    }

    return (
        <div className="p-4 md:p-8 pb-16 md:pb-24 bg-slate-50 min-h-screen text-slate-900 pt-24 md:pt-30">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Area 51 Dashboard</h1>
                        <p role="status" className="text-slate-500 text-sm md:text-base">{labels.count.replace("{count}", total.toLocaleString(locale))}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Link
                            href={getLocalizedPathname("/area-51-sec/place-order", lang as Locale)}
                            className="min-h-11 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 md:px-6 py-2 rounded-lg font-medium text-center flex-1 md:flex-none"
                        >
                            {dictionary.placeOrder.title}
                        </Link>
                        <Link
                            href={getLocalizedPathname("/area-51-sec/contact-messages", locale)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-center flex-1 md:flex-none"
                        >
                            Messages
                        </Link>
                        <Link
                            href={getLocalizedPathname("/area-51-sec/popup-settings", locale)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-center flex-1 md:flex-none"
                        >
                            Popup Settings
                        </Link>
                        {canAdd && (
                            <Link
                                href={getLocalizedPathname("/area-51-sec/new", locale)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-center flex-1 md:flex-none"
                            >
                                + Add New Place
                            </Link>
                        )}
                    </div>
                </div>

                <AdminPlaceSearch lang={locale} labels={labels} />

                {/* Places Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full text-start border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-sm">Location Name</th>
                                <th className="p-4 font-semibold text-sm">Category</th>
                                <th className="p-4 font-semibold text-sm text-center">Featured</th>
                                <th className="p-4 font-semibold text-sm text-center">Visibility</th>
                                <th className="p-4 font-semibold text-sm text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {places.map(place => (
                                <tr key={place._id.toString()} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium">
                                            {place.title[locale] || place.title.en}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{place.slug?.en}</div>
                                    </td>

                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {place.category}
                                        </span>
                                    </td>

                                    <td className="p-4 text-center">
                                        <AdminButton
                                            action={toggleFeaturedAction.bind(null, place._id.toString())}
                                            label={place.featured ? "⭐ Featured" : "☆ Standard"}
                                            loadingLabel="Updating..."
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${place.featured
                                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                : "bg-slate-100 text-slate-400 border border-slate-200"
                                                }`}
                                        />
                                    </td>

                                    <td className="p-4 text-center">
                                        <AdminButton
                                            action={toggleVisibilityAction.bind(null, place._id.toString())}
                                            label={place.hidden ? "👁️‍🗨️ Hidden" : "👁️ Visible"}
                                            loadingLabel="Updating..."
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${place.hidden
                                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                }`}
                                        />
                                    </td>

                                    <td className="p-4 text-end space-x-2">
                                        <Link
                                            href={getLocalizedPathname(`/area-51-sec/edit/${place._id}`, locale)}
                                            className="text-sm text-blue-600 hover:underline me-4 inline-block"
                                        >
                                            Edit
                                        </Link>

                                        {canDelete && (
                                            <AdminButton
                                                action={deletePlaceAction.bind(null, place._id.toString())}
                                                label="Delete"
                                                loadingLabel="Deleting..."
                                                confirmMessage="Are you absolutely sure? This cannot be undone."
                                                className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer inline-block"
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col divide-y divide-slate-100">
                        {places.map(place => (
                            <div key={place._id.toString()} className="p-4 flex flex-col gap-3">
                                <div>
                                    <div className="font-medium text-lg text-slate-900">{place.title[locale] || place.title.en}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">{place.slug?.en}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {place.category}
                                    </span>
                                    <div className="flex gap-2">
                                        <AdminButton
                                            action={toggleFeaturedAction.bind(null, place._id.toString())}
                                            label={place.featured ? "⭐ Featured" : "☆ Standard"}
                                            loadingLabel="..."
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${place.featured
                                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                : "bg-slate-100 text-slate-400 border border-slate-200"
                                                }`}
                                        />
                                        <AdminButton
                                            action={toggleVisibilityAction.bind(null, place._id.toString())}
                                            label={place.hidden ? "👁️‍🗨️ Hidden" : "👁️ Visible"}
                                            loadingLabel="..."
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${place.hidden
                                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                }`}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2 pt-3 border-t border-slate-50">
                                    <Link
                                        href={getLocalizedPathname(`/area-51-sec/edit/${place._id}`, locale)}
                                        className="flex-1 text-center py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold active:scale-95 transition-transform"
                                    >
                                        Edit
                                    </Link>
                                    {canDelete && (
                                        <div className="flex-1">
                                            <AdminButton
                                                action={deletePlaceAction.bind(null, place._id.toString())}
                                                label="Delete"
                                                loadingLabel="Deleting..."
                                                confirmMessage="Are you absolutely sure? This cannot be undone."
                                                className="w-full h-full py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {places.length === 0 && (
                        <div role="status" className="px-4 py-12 md:py-20 text-center text-slate-500">
                            {invalid ? labels.invalid : query ? labels.noResults : labels.empty}
                        </div>
                    )}
                </div>
                {pageCount > 1 && (
                    <nav aria-label={labels.pagination} className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                        {page > 1 ? (
                            <Link href={pageHref(page - 1)} scroll={false} className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                                {labels.previous}
                            </Link>
                        ) : <span />}
                        <span className="text-slate-600">{labels.page.replace("{page}", String(page)).replace("{pages}", String(pageCount))}</span>
                        {page < pageCount ? (
                            <Link href={pageHref(page + 1)} scroll={false} className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                                {labels.next}
                            </Link>
                        ) : <span />}
                    </nav>
                )}
            </div>
        </div>
    );
}
