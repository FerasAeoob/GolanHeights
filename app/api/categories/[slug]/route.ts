import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { CategorySchema } from "@/schemas/place.schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const result = await params;

        const parsedCategory = CategorySchema.safeParse({ category: result.slug });

        if (!parsedCategory.success) {
            return NextResponse.json({ error: "Category not found ❌" }, { status: 404 });
        }
        const category = parsedCategory.data.category;


        const places = await Place.find({ category }).lean();
        return NextResponse.json(places, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch places ❌" },
            { status: 500 }
        );
    }
}