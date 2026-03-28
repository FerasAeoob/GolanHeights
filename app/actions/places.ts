'use server'

import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { createplaceschema, UpdatePlaceSchema } from "@/database/place.schema";
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { generateSlugs } from "@/utils/slug";

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

        const slug = generateSlugs(data.title);

        const newPlace = await Place.create({
            ...data,
            slug
        });

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]/places');

        return { success: true, id: newPlace._id.toString() };
    } catch (error: any) {
        console.error("Create Error:", error);
        if (error.code === 11000) return { error: "A place with this title already exists." };
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

        // Regenerate slugs if title changed
        if (data.title) {
            existingPlace.slug = generateSlugs(data.title);
        }

        // Apply all updates
        Object.keys(data).forEach((key) => {
            existingPlace.set(key, data[key]);
        });

        await existingPlace.save();

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath(`/[lang]/places/${existingPlace.slug.en}`);
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