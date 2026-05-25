'use server'

import connectDB from "@/lib/mongodb";
import Settings from "@/database/settings.model";
import Place from "@/database/place.model";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { revalidatePath } from 'next/cache';
import mongoose from "mongoose";

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
 * Server Action to update the homepage Special Place Popup configuration.
 */
export async function updatePopupSettingsAction(enabled: boolean, placeId: string | null) {
    try {
        await verifyAdmin();
        await connectDB();

        let validatedPlaceId = null;
        if (placeId) {
            if (!mongoose.Types.ObjectId.isValid(placeId)) {
                return { errorCode: "INVALID_PLACE_ID" };
            }
            validatedPlaceId = new mongoose.Types.ObjectId(placeId);

            // Validate that the Place exists in the database
            const placeExists = await Place.exists({ _id: validatedPlaceId });
            if (!placeExists) {
                return { errorCode: "PLACE_NOT_FOUND" };
            }
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({
                specialPlacePopupEnabled: enabled,
                specialPlacePopupPlaceId: validatedPlaceId,
            });
        } else {
            settings.specialPlacePopupEnabled = enabled;
            settings.specialPlacePopupPlaceId = validatedPlaceId;
        }

        await settings.save();

        // Revalidate localized home routes securely
        revalidatePath('/[lang]');
        revalidatePath('/');

        return { success: true };
    } catch (error: any) {
        console.error("Update Settings Error:", error);
        return { errorCode: "UNKNOWN_ERROR" };
    }
}
