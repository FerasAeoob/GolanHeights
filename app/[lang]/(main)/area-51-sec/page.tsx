import { getPlaces } from "@/lib/db/places";
import AdminButton from "@/components/admin/AdminButton";
import { deletePlaceAction, toggleFeaturedAction } from "@/app/actions/places";
import Link from "next/link";

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const places = await getPlaces();

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-slate-900 pt-30">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Area 51 Dashboard</h1>
                        <p className="text-slate-500">Managing {places.length} locations in Golan Heights</p>
                    </div>
                    <Link
                        href={`/${lang}/area-51-sec/new`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                    >
                        + Add New Place
                    </Link>
                </div>

                {/* Places Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-sm">Location Name</th>
                                <th className="p-4 font-semibold text-sm">Category</th>
                                <th className="p-4 font-semibold text-sm text-center">Featured</th>
                                <th className="p-4 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {places.map((place: any) => (
                                <tr key={place._id.toString()} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium">
                                            {place.title[lang] || place.title.en}
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

                                    <td className="p-4 text-right space-x-2">
                                        <Link
                                            href={`/${lang}/area-51-sec/edit/${place._id}`}
                                            className="text-sm text-blue-600 hover:underline mr-4"
                                        >
                                            Edit
                                        </Link>

                                        <AdminButton
                                            action={deletePlaceAction.bind(null, place._id.toString())}
                                            label="Delete"
                                            loadingLabel="Deleting..."
                                            confirmMessage="Are you absolutely sure? This cannot be undone."
                                            className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {places.length === 0 && (
                        <div className="p-20 text-center text-slate-400">
                            No places found in the database. Start by adding one!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}