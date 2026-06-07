import connectDB from "@/lib/mongodb";
import Place, { IPublicPlaceDTO } from "@/database/place.model";
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

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
    const place = await Place.findById(id).lean() as any;
    if (!place) return null;

    // Populate owner email for the admin edit form
    if (place.ownerId) {
        const User = (await import("@/database/user/user.model")).default;
        const owner = await User.findById(place.ownerId).select('email').lean<{ email: string }>();
        place.ownerEmail = owner?.email ?? '';
    }

    return JSON.parse(JSON.stringify(place)); // Serialize ObjectIds
}

/**
 * Fetch a single place by its slug, querying the DB.
 */
async function fetchPlaceBySlug(slug: string) {
    await connectDB();
    const place = await Place.findOne({
        $or: [
            { "slug.en": slug.toLowerCase() },
            { "slug.he": slug.toLowerCase() },
            { "slug.ar": slug.toLowerCase() }
        ],
        hidden: { $ne: true }
    }).lean();
    if (!place) return null;
    return JSON.parse(JSON.stringify(place)); // Serialize ObjectIds/dates
}

/**
 * Cached place detail fetch across all requests/instances (10 min revalidation).
 */
export const getCachedPlaceBySlug = unstable_cache(
    async (slug: string) => {
        return fetchPlaceBySlug(slug);
    },
    ['place-details-by-slug'],
    {
        revalidate: 600, // Cache for 10 minutes (revalidates in background)
        tags: ['places']
    }
);

/**
 * Request-memoized place details (shared between generateMetadata and page rendering).
 */
export const getRequestMemoizedPlace = cache(async (slug: string) => {
    return getCachedPlaceBySlug(slug);
});

/**
 * Fetch full place details directly from MongoDB without unstable_cache, keeping all fields including ownerId.
 */
export async function getFullPlaceBySlug(slug: string) {
    await connectDB();
    const place = await Place.findOne({
        $or: [
            { "slug.en": slug.toLowerCase() },
            { "slug.he": slug.toLowerCase() },
            { "slug.ar": slug.toLowerCase() }
        ],
        hidden: { $ne: true }
    })
    .select("title slug description shortDescription category averageRating reviewsCount price duration openHours open mapLink images location contact instagram instagramUrl instagramHandle featured createdAt updatedAt ownerId")
    .lean();
    if (!place) return null;
    return JSON.parse(JSON.stringify(place));
}

/**
 * Request-memoized full place details (shared between generateMetadata and page rendering in a single request).
 */
export const getRequestMemoizedFullPlace = cache(async (slug: string) => {
    return getFullPlaceBySlug(slug);
});

export function toPublicPlaceDTO(place: any): IPublicPlaceDTO {
    if (!place) {
        throw new Error("Invalid place data passed to toPublicPlaceDTO");
    }
    return {
        _id: place._id?.toString() || place._id,
        title: place.title,
        slug: place.slug,
        description: place.description,
        shortDescription: place.shortDescription,
        category: place.category,
        averageRating: place.averageRating,
        reviewsCount: place.reviewsCount,
        price: place.price,
        duration: place.duration,
        openHours: place.openHours,
        open: place.open,
        mapLink: place.mapLink,
        images: place.images,
        location: place.location,
        contact: place.contact,
        instagram: place.instagram,
        instagramUrl: place.instagramUrl,
        instagramHandle: place.instagramHandle,
        featured: place.featured,
        createdAt: place.createdAt?.toISOString ? place.createdAt.toISOString() : place.createdAt,
        updatedAt: place.updatedAt?.toISOString ? place.updatedAt.toISOString() : place.updatedAt,
    };
}
