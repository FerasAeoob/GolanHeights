import connectDB from "@/lib/mongodb";
import Settings from "@/database/settings.model";

export async function getSettings() {
    await connectDB();
    const settings = await Settings.findOneAndUpdate(
        {},
        {
            $setOnInsert: {
                specialPlacePopupEnabled: false,
                specialPlacePopupPlaceId: null,
            }
        },
        { upsert: true, new: true, lean: true }
    );
    return JSON.parse(JSON.stringify(settings));
}
