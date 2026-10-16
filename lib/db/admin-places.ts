import connectDB from "@/lib/mongodb";
import Place, { type IPlaceBase } from "@/database/place.model";
import { locales } from "@/lib/get-dictionary";
import { parseAdminPlaceSearch, type AdminPlaceSearchParams } from "@/lib/admin-place-search";

const PAGE_SIZE = 50;
type AdminPlaceRow = Pick<IPlaceBase, "title" | "slug" | "category" | "featured" | "hidden"> & { _id: string };
type AdminPlaceDocument = Omit<AdminPlaceRow, "_id"> & { _id: { toString(): string } };

/** Called by the admin page only after its existing server-side authorization. */
export async function getAdminPlaces(params: AdminPlaceSearchParams) {
    const { query, page: requestedPage, invalid } = parseAdminPlaceSearch(params);
    const empty = { places: [] as AdminPlaceRow[], total: 0, page: 1, pageCount: 1, query, invalid };
    if (invalid) return empty;

    // Search literal text, never a user-supplied regular expression.
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = query ? {
        $or: ["title", "slug", "location.name"].flatMap(field =>
            locales.map(locale => ({ [`${field}.${locale}`]: { $regex: escaped, $options: "i" } })),
        ),
    } : {};

    await connectDB();
    const total = await Place.countDocuments(filter);
    if (total === 0) return empty;
    const pageCount = Math.ceil(total / PAGE_SIZE);
    const page = Math.min(requestedPage, pageCount);
    const places = await Place.find(filter)
        .select("_id title slug category featured hidden")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean<AdminPlaceDocument[]>();

    return {
        places: places.map(place => ({ ...place, _id: place._id.toString() })),
        total, page, pageCount, query, invalid,
    };
}
