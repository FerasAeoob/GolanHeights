import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from '@/database/place.model';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const place = await Place.findOne({ slug: (await params).slug });

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
