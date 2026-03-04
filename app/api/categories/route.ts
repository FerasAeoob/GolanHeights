import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";

export async function GET() {
    try {
        await connectDB();

        const categories = await Place.distinct("category");

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch categories ❌" },
            { status: 500 }
        );
    }
}
