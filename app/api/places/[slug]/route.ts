import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from '@/database/place.model';
import { UpdatePlaceSchema, SlugSchema } from "@/database/place.schema";

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
            ]
        }).lean();
        return NextResponse.json(place, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch place ❌" },
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

        // Regenerate slug if English title changed
        if (updateData.title?.en) {
            updateData.slug = updateData.title.en
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "");
        }

        // Update the place
        const updatedPlace = await Place.findOneAndUpdate(
            { 
                $or: [
                    { "slug.en": slug },
                    { "slug.he": slug },
                    { "slug.ar": slug }
                ]
             },
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedPlace) {
            return NextResponse.json({ error: "Place not found ❌" }, { status: 404 });
        }

        return NextResponse.json(updatedPlace, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to update place ❌", details: error.message },
            { status: 500 }
        );
    }
}
