import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from '@/database/place.model';
import { generateEnglishSlug } from "@/utils/slug";
import { UpdatePlaceSchema, SlugSchema } from "@/database/place.schema";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const result = await params;

        const parsedSlug = SlugSchema.safeParse(result);

        if (!parsedSlug.success) {
            return NextResponse.json({ error: "Place not found ❌" }, { status: 404 });
        }
        const slug = parsedSlug.data.slug;


        const place = await Place.findOne({
            $or: [
                { "slug.en": slug },
                { "slug.he": slug },
                { "slug.ar": slug }
            ],
            hidden: { $ne: true }
        }).lean();
        return NextResponse.json(place, { status: 200 });
    } catch (error) {
        console.error("GET PLACE ERROR:", error);
        return NextResponse.json(
            { success: false, errorCode: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();

        const user = await getCurrentUser();
        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: "Forbidden: Admin Access Required ❌" },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const slug = resolvedParams.slug?.toLowerCase();
        if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

        // Parse request body
        const body = await req.json();
        const parsedBody = UpdatePlaceSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsedBody.error.issues },
                { status: 400 }
            );
        }

        const updateData: any = parsedBody.data;

        // Fetch the existing place to correctly merge nested fields
        const place = await Place.findOne({
            $or: [
                { "slug.en": slug },
                { "slug.he": slug },
                { "slug.ar": slug }
            ]
        });

        if (!place) {
            return NextResponse.json({ error: "Place not found ❌" }, { status: 404 });
        }

        // Merge updates safely to avoid overwriting entire nested objects (title, description, etc)
        Object.keys(updateData).forEach((key) => {
            if (
                typeof updateData[key] === "object" &&
                updateData[key] !== null &&
                !Array.isArray(updateData[key])
            ) {
                place.set(key, { ...(place.get(key) || {}), ...updateData[key] });
            } else {
                place.set(key, updateData[key]);
            }
        });

        if (place.isModified("title.en") || place.title?.en) {
            place.slug.en = generateEnglishSlug(place.title.en);
        }

        // Save the document (this runs validators)
        const updatedPlace = await place.save();

        return NextResponse.json(updatedPlace, { status: 200 });
    } catch (error: any) {
        console.error("UPDATE PLACE ERROR:", error);
        return NextResponse.json(
            { success: false, errorCode: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}