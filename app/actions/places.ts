'use server'

import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { createplaceschema, UpdatePlaceSchema } from "@/database/place.schema";
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { generateEnglishSlug } from "@/utils/slug";

import { getCurrentUser } from "@/lib/auth";
import { isAdmin, isOwner } from "@/lib/permissions";
import User from "@/database/user/user.model";

/**
 * HELPER: Resolves an email string to a User ObjectId.
 * Returns { ownerId } on success, { errorCode } on failure.
 */
async function resolveOwnerEmail(email: string): Promise<{ ownerId: string } | { errorCode: string }> {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('_id role').lean<{ _id: any; role: string }>();
    if (!user) return { errorCode: 'OWNER_EMAIL_NOT_FOUND' };

    // Auto-promote to business role when assigned as a place owner
    if (user.role !== 'business' && user.role !== 'admin') {
        await User.updateOne({ _id: user._id }, { $set: { role: 'business' } });
    }

    return { ownerId: user._id.toString() };
}

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

        if (data?.contact) {
            if (data.contact.instagramHandle) {
                let handle = data.contact.instagramHandle.replace(/\s+/g, "");
                if (handle && !handle.startsWith("@")) {
                    handle = "@" + handle;
                }
                data.contact.instagramHandle = handle;
                data.instagramHandle = handle;
                data.instagram = data.instagram || {};
                data.instagram.handle = handle;
            }
            if (data.contact.instagram) {
                const url = data.contact.instagram.trim();
                data.contact.instagram = url;
                data.instagramUrl = url;
                data.instagram = data.instagram || {};
                data.instagram.url = url;
            }
        }

        const validation = createplaceschema.safeParse(data);
        if (!validation.success) {
            return { errorCode: "VALIDATION_FAILED", details: validation.error.format() };
        }
        const validatedData = validation.data;

        // Resolve ownerEmail → ownerId before saving
        const ownerEmail: string | undefined = (data as any).ownerEmail?.trim();
        if (ownerEmail) {
            const resolved = await resolveOwnerEmail(ownerEmail);
            if ('errorCode' in resolved) return resolved;
            validatedData.ownerId = resolved.ownerId;
        } else {
            validatedData.ownerId = null;
        }
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
        return { errorCode: "UNKNOWN_ERROR" };
    }
}

/* ============================================================
   2. UPDATE PLACE
   ============================================================ */
export async function updatePlaceAction(id: string, data: any) {
    try {
        await verifyAdmin();
        await connectDB();

        if (data?.contact) {
            if (data.contact.instagramHandle) {
                let handle = data.contact.instagramHandle.replace(/\s+/g, "");
                if (handle && !handle.startsWith("@")) {
                    handle = "@" + handle;
                }
                data.contact.instagramHandle = handle;
                data.instagramHandle = handle;
                data.instagram = data.instagram || {};
                data.instagram.handle = handle;
            }
            if (data.contact.instagram) {
                const url = data.contact.instagram.trim();
                data.contact.instagram = url;
                data.instagramUrl = url;
                data.instagram = data.instagram || {};
                data.instagram.url = url;
            }
        }

        const validation = UpdatePlaceSchema.safeParse(data);
        if (!validation.success) {
            return { errorCode: "VALIDATION_FAILED", details: validation.error.format() };
        }
        const updateData = {
            ...validation.data,
            slug: { ...validation.data.slug, en: '' },
        };

        // Resolve ownerEmail → ownerId before saving
        const ownerEmail: string | undefined = (data as any).ownerEmail?.trim();
        if (ownerEmail) {
            const resolved = await resolveOwnerEmail(ownerEmail);
            if ('errorCode' in resolved) return resolved;
            updateData.ownerId = resolved.ownerId;
        } else {
            updateData.ownerId = null;
        }

        const existingPlace = await Place.findById(id);
        if (!existingPlace) return { errorCode: "PLACE_NOT_FOUND" };

        // 2a. Only regenerate English slug if title changed or if it was missing completely
        // The validated object from Zod includes the normalized nested contact data.
        if (updateData.title?.en && (updateData.title.en !== existingPlace.title.en || !existingPlace.slug?.en)) {
            updateData.slug = updateData.slug || {};
            updateData.slug.en = generateEnglishSlug(updateData.title.en);
        } else {
            // Keep existing English slug
            updateData.slug = updateData.slug || {};
            updateData.slug.en = existingPlace.slug.en;
        }

        // 2b. Explicit uniqueness checks against other documents
        const duplicateEn = await Place.findOne({ _id: { $ne: id }, "slug.en": updateData.slug.en });
        if (duplicateEn) return { errorCode: "SLUG_EN_ALREADY_EXISTS" };

        if (updateData.slug.he) {
            const duplicateHe = await Place.findOne({ _id: { $ne: id }, "slug.he": updateData.slug.he });
            if (duplicateHe) return { errorCode: "SLUG_HE_ALREADY_EXISTS" };
        }
        
        if (updateData.slug.ar) {
            const duplicateAr = await Place.findOne({ _id: { $ne: id }, "slug.ar": updateData.slug.ar });
            if (duplicateAr) return { errorCode: "SLUG_AR_ALREADY_EXISTS" };
        }

        // Apply all updates
        Object.keys(updateData).forEach((key) => {
            if (key === 'slug') {
                existingPlace.slug.en = updateData.slug.en || existingPlace.slug.en;
                if (updateData.slug.he) existingPlace.slug.he = updateData.slug.he;
                if (updateData.slug.ar) existingPlace.slug.ar = updateData.slug.ar;
            } else {
                existingPlace.set(key, updateData[key as keyof typeof updateData]);
            }
        });

        // Explicitly set all Instagram formats to prevent HMR or Mongoose path stripping
        if (updateData.contact) {
            existingPlace.set('contact.instagramHandle', updateData.contact.instagramHandle || '');
            existingPlace.set('contact.instagram', updateData.contact.instagram || '');
        }
        if (updateData.instagram) {
            existingPlace.set('instagram.handle', updateData.instagram.handle || '');
            existingPlace.set('instagram.url', updateData.instagram.url || '');
        }
        existingPlace.set('instagramHandle', updateData.instagramHandle || '');
        existingPlace.set('instagramUrl', updateData.instagramUrl || '');

        await existingPlace.save();

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath(`/[lang]/places/${existingPlace.slug?.en}`);
        revalidatePath('/[lang]/places');

        return { success: true };
    } catch (error: any) {
        console.error("Update Error:", error);
        return { errorCode: "UNKNOWN_ERROR" };
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
        return { errorCode: "UNKNOWN_ERROR" };
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
        return { errorCode: "UNKNOWN_ERROR" };
    }
}

/* ============================================================
   5. TOGGLE VISIBILITY (HIDE/SHOW)
   — Works with `.bind(null, id)` from the dashboard.
   — Automatically flips the current hidden value.
   ============================================================ */
export async function toggleVisibilityAction(id: string) {
    try {
        await verifyAdmin();
        await connectDB();

        const place = await Place.findById(id);
        if (!place) return { errorCode: "PLACE_NOT_FOUND" };

        place.hidden = !place.hidden;
        await place.save();

        revalidatePath('/[lang]/area-51-sec');
        revalidatePath('/[lang]/places');
        revalidatePath('/[lang]');
        if (place.slug?.en) {
            revalidatePath(`/[lang]/places/${place.slug.en}`);
        }

        return { success: true, hidden: place.hidden };
    } catch (error: any) {
        return { errorCode: "UNKNOWN_ERROR" };
    }
}
