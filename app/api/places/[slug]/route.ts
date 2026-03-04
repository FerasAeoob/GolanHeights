import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place, { IPlace } from '@/database/place.model';
import { z } from "zod";


export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const resolvedParams = await params;

        const slug = resolvedParams.slug.toLowerCase();
        const place = await Place.findOne({ slug }).lean();

        if (!place) {
            return NextResponse.json({ error: "Place not found ❌" }, { status: 404 });
        }

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
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();

        const resolvedParams = await params;
        const slug = resolvedParams.slug?.toLowerCase();
        if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

        // Zod schema for update payload
        const UpdatePlaceSchema = z.object({
            title: z.object({
                en: z.string().min(3).optional(),
                he: z.string().optional(),
                ar: z.string().optional(),
            }).optional(),
            description: z.object({
                en: z.string().min(10).optional(),
                he: z.string().optional(),
                ar: z.string().optional(),
            }).optional(),
            shortDescription: z.object({
                en: z.string().max(255).optional(),
                he: z.string().max(255).optional(),
                ar: z.string().max(255).optional(),
            }).optional(),
            category: z.enum(["nature", "restaurant", "activity", "hotel", "viewpoint"]).optional(),
            image: z.string().min(1).optional(),
            location: z.object({
                lat: z.number(),
                lng: z.number(),
            }).optional(),
            contact: z.object({
                phone: z.string().optional(),
                website: z.string().optional(),
                instagram: z.string().optional(),
            }).optional(),
            featured: z.boolean().optional(),
        });

        // Parse request body
        const body = await req.json();
        const parsedBody = UpdatePlaceSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsedBody.error.issues },
                { status: 400 }
            );
        }

        const updateData: IPlace = parsedBody.data;

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
            { slug: slug },
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
