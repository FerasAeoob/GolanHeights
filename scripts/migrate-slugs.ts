import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load .env
dotenv.config({ path: ".env.local" });
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI");

// Basic manual schema to bypass the strict Zod validators, we're just injecting raw data
const placeSchema = new mongoose.Schema({
    title: { en: String, he: String, ar: String },
    slug: { en: String, he: String, ar: String },
}, { strict: false });

const PlaceBase = mongoose.models.Place || mongoose.model("Place", placeSchema);

function cleanSlug(text: string): string {
    if (!text) return "";
    return text.toString().toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^\w-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

async function run() {
    console.log("🛠️ Starting Migration: Backfilling missing & invalid slugs...");
    await mongoose.connect(uri);

    const places = await PlaceBase.find({});
    console.log(`Found ${places.length} total places to inspect...`);

    let updatedCount = 0;

    for (const p of places) {
        let isModified = false;
        
        // Ensure slug is an object. Some old ones might be strings.
        if (!p.slug || typeof p.slug === "string") {
            console.log(`   [WARN] Document ${p._id} has malformed or missing slug completely.`);
            p.slug = { en: p.slug || cleanSlug(p.title?.en || `place-${Math.random().toString(36).substring(7)}`), he: "", ar: "" };
            isModified = true;
        }

        ['he', 'ar'].forEach(lang => {
            // Check if missing, empty, or invalid (contains non a-z0-9-)
            const currentSlug = p.slug[lang];
            const isValid = currentSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(currentSlug);

            if (!isValid) {
                // First try to just clean whatever they had
                const cleaned = cleanSlug(currentSlug);
                if (cleaned && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned)) {
                    p.slug[lang] = cleaned;
                } else {
                    // Fatal fallback to ensure unique safe index
                    p.slug[lang] = `${p.slug.en || 'unknown-place'}-${lang}-${Math.random().toString(36).substring(7)}`;
                }
                isModified = true;
            }
        });

        // Ensure EN is completely clean too
        if (!p.slug.en || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug.en)) {
            p.slug.en = cleanSlug(p.title?.en || p.slug?.en) || `place-${Math.random().toString(36).substring(7)}`;
            isModified = true;
        }

        if (isModified) {
            console.log(`   [UPDATE] Migrating ${p.title?.en} -> ${JSON.stringify(p.slug)}`);
            await p.save();
            updatedCount++;
        }
    }

    console.log(`✅ Migration complete. Updated ${updatedCount} legacy records.`);
    mongoose.connection.close();
}

run().catch(console.error);
