'use server'

import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { createplaceschema, UpdatePlaceSchema } from "@/database/place.schema";
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { generateEnglishSlug } from "@/utils/slug";

import { getCurrentUser } from "@/lib/auth";
import { isAdmin, isOwner } from "@/lib/permissions";

/**
 * HELPER: Verifies if the request is from an authenticated Admin.
 */
async function verifyAdmin() {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
        throw new Error("UNAUTHORIZED");
    }
}

/**
 * HELPER: Verifies if the request is from the Site Owner.
 */
async function verifyOwner() {
    const user = await getCurrentUser();
    if (!isOwner(user)) {
        throw new Error("FORBIDDEN");
    }
}

/* ============================================================
   1. CREATE PLACE
   ============================================================ */
export async function createPlaceAction(data: any) {
    try {
        await verifyOwner();
        await connectDB();

        const validation = createplaceschema.safeParse(data);
        if (!validation.success) {
            return { errorCode: "VALIDATION_FAILED", details: validation.error.format() };
        }

        const validatedData = validation.data;
        const enSlug = generateEnglishSlug(validatedData.title.en);

        // 2a. Explicit uniqueness checks so the user gets friendly errors
        const existingEn = await Place.findOne({ "slug.en": enSlug });
        if (existingEn) return { errorCode: "SLUG_EN_ALREADY_EXISTS" };

        const existingHe = await Place.findOne({ "slug.he": validatedData.slug.he });
        if (existingHe) return { errorCode: "SLUG_HE_ALREADY_EXISTS" };

        const existingAr = await Place.findOne({ "slug.ar": validatedData.slug.ar });
        if (existingAr) return { errorCode: "SLUG_AR_ALREADY_EXISTS" };

        const newPlace = await Place.create({
            ...validatedData,
            slug: { en: enSlug, he: validatedData.slug.he, ar: validatedData.slug.ar },
        });

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]/places');

        return { success: true, id: newPlace._id.toString() };
    } catch (error: any) {
        console.error("Create Error:", error);
        return { errorCode: error.message || "UNKNOWN_ERROR" };
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
            return { errorCode: "VALIDATION_FAILED", details: validation.error.format() };
        }

        const existingPlace = await Place.findById(id);
        if (!existingPlace) return { errorCode: "PLACE_NOT_FOUND" };

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
        if (duplicateEn) return { errorCode: "SLUG_EN_ALREADY_EXISTS" };

        if (data.slug.he) {
            const duplicateHe = await Place.findOne({ _id: { $ne: id }, "slug.he": data.slug.he });
            if (duplicateHe) return { errorCode: "SLUG_HE_ALREADY_EXISTS" };
        }
        
        if (data.slug.ar) {
            const duplicateAr = await Place.findOne({ _id: { $ne: id }, "slug.ar": data.slug.ar });
            if (duplicateAr) return { errorCode: "SLUG_AR_ALREADY_EXISTS" };
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
        return { errorCode: error.message || "UNKNOWN_ERROR" };
    }
}

/* ============================================================
   3. DELETE PLACE
   ============================================================ */
export async function deletePlaceAction(id: string) {
    try {
        await verifyOwner();
        await connectDB();

        const placeToDelete = await Place.findById(id);
        if (!placeToDelete) return { errorCode: "PLACE_ALREADY_GONE" };

        await Place.findByIdAndDelete(id);

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]/places');

        return { success: true };
    } catch (error: any) {
        console.error("Delete Error:", error);
        return { errorCode: error.message || "UNKNOWN_ERROR" };
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
        if (!place) return { errorCode: "PLACE_NOT_FOUND" };

        place.featured = !place.featured;
        await place.save();

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]');

        return { success: true, featured: place.featured };
    } catch (error: any) {
        return { errorCode: error.message || "UNKNOWN_ERROR" };
    }
}