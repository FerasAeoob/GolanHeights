import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";

/**
 * Fetch all places, sorted by newest first.
 * Used by the admin dashboard table.
 */
export async function getPlaces() {
    await connectDB();
    const places = await Place.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(places)); // Serialize ObjectIds for client
}

/**
 * Fetch a single place by its MongoDB _id.
 * Used by the edit form to pre-populate fields.
 */
export async function getPlaceById(id: string) {
    await connectDB();
    const place = await Place.findById(id).lean();
    if (!place) return null;
    return JSON.parse(JSON.stringify(place)); // Serialize ObjectIds
}
