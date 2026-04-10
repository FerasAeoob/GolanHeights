'use server'

import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { createplaceschema, UpdatePlaceSchema } from "@/database/place.schema";
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { generateEnglishSlug } from "@/utils/slug";

/**
 * HELPER: Verifies if the request is from an authenticated Admin.
 */
async function verifyAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session || session.value !== 'true') {
        throw new Error("Unauthorized: Access Denied ❌");
    }
}

/* ============================================================
   1. CREATE PLACE
   ============================================================ */
export async function createPlaceAction(data: any) {
    try {
        await verifyAdmin();
        await connectDB();

        const validation = createplaceschema.safeParse(data);
        if (!validation.success) {
            return { error: "Validation Failed", details: validation.error.format() };
        }

        data.slug.en = generateEnglishSlug(data.title.en);

        // 2a. Explicit uniqueness checks so the user gets friendly errors
        const existingEn = await Place.findOne({ "slug.en": data.slug.en });
        if (existingEn) return { error: `The generated English slug "${data.slug.en}" is already taken by another place.` };

        const existingHe = await Place.findOne({ "slug.he": data.slug.he });
        if (existingHe) return { error: `The exact Hebrew slug "${data.slug.he}" is already taken.` };

        const existingAr = await Place.findOne({ "slug.ar": data.slug.ar });
        if (existingAr) return { error: `The exact Arabic slug "${data.slug.ar}" is already taken.` };

        const newPlace = await Place.create(data);

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]/places');

        return { success: true, id: newPlace._id.toString() };
    } catch (error: any) {
        console.error("Create Error:", error);
        return { error: error.message || "Something went wrong during creation." };
    }
}

/* ============================================================
   2. UPDATE PLACE
   ============================================================ */
export async function updatePlaceAction(id: string, data: any) {
    try {
        await verifyAdmin();
        await connectDB();

        const validation = UpdatePlaceSchema.safeParse(data);
        if (!validation.success) {
            return { error: "Invalid Update Data", details: validation.error.format() };
        }

        const existingPlace = await Place.findById(id);
        if (!existingPlace) return { error: "Place not found ❌" };

        // 2a. Only regenerate English slug if title changed or if it was missing completely
        // The data object received from Zod includes data.title.en, data.slug.he, data.slug.ar
        if (data.title?.en && (data.title.en !== existingPlace.title.en || !existingPlace.slug?.en)) {
            data.slug = data.slug || {};
            data.slug.en = generateEnglishSlug(data.title.en);
        } else {
            // Keep existing English slug
            data.slug = data.slug || {};
            data.slug.en = existingPlace.slug.en;
        }

        // 2b. Explicit uniqueness checks against other documents
        const duplicateEn = await Place.findOne({ _id: { $ne: id }, "slug.en": data.slug.en });
        if (duplicateEn) return { error: `The English slug "${data.slug.en}" is already taken.` };

        if (data.slug.he) {
            const duplicateHe = await Place.findOne({ _id: { $ne: id }, "slug.he": data.slug.he });
            if (duplicateHe) return { error: `The Hebrew slug "${data.slug.he}" is already taken.` };
        }
        
        if (data.slug.ar) {
            const duplicateAr = await Place.findOne({ _id: { $ne: id }, "slug.ar": data.slug.ar });
            if (duplicateAr) return { error: `The Arabic slug "${data.slug.ar}" is already taken.` };
        }

        // Apply all updates
        Object.keys(data).forEach((key) => {
            if (key === 'slug') {
                existingPlace.slug.en = data.slug.en || existingPlace.slug.en;
                if (data.slug.he) existingPlace.slug.he = data.slug.he;
                if (data.slug.ar) existingPlace.slug.ar = data.slug.ar;
            } else {
                existingPlace.set(key, data[key]);
            }
        });

        await existingPlace.save();

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath(`/[lang]/places/${existingPlace.slug?.en}`);
        revalidatePath('/[lang]/places');

        return { success: true };
    } catch (error: any) {
        console.error("Update Error:", error);
        return { error: error.message || "Failed to update place." };
    }
}

/* ============================================================
   3. DELETE PLACE
   ============================================================ */
export async function deletePlaceAction(id: string) {
    try {
        await verifyAdmin();
        await connectDB();

        const placeToDelete = await Place.findById(id);
        if (!placeToDelete) return { error: "Place already gone ❌" };

        await Place.findByIdAndDelete(id);

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]/places');

        return { success: true };
    } catch (error: any) {
        console.error("Delete Error:", error);
        return { error: "Could not delete the place." };
    }
}

/* ============================================================
   4. TOGGLE FEATURED
   — Works with `.bind(null, id)` from the dashboard.
   — Automatically flips the current value.
   ============================================================ */
export async function toggleFeaturedAction(id: string) {
    try {
        await verifyAdmin();
        await connectDB();

        const place = await Place.findById(id);
        if (!place) return { error: "Place not found" };

        place.featured = !place.featured;
        await place.save();

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]');

        return { success: true, featured: place.featured };
    } catch (error) {
        return { error: "Failed to update featured status." };
    }
}