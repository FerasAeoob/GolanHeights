import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";

/* ======================
   GET ALL PLACES
====================== */
export async function GET() {
    try {
        await connectDB();

        const places = await Place.find().sort({ createdAt: -1 });

        return NextResponse.json(places, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch places ❌" },
            { status: 500 }
        );
    }
}

/* ======================
   CREATE NEW PLACE
====================== */
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        // Basic validation
        if (
            !body.title ||
            !body.description ||
            !body.shortDescription ||
            !body.category ||
            !body.image ||
            !body.location
        ) {
            return NextResponse.json(
                { error: "Missing required fields ❌" },
                { status: 400 }
            );
        }

        const newPlace = await Place.create({
            title: body.title,
            description: body.description,
            shortDescription: body.shortDescription,
            category: body.category,
            image: body.image,
            location: body.location,
            contact: body.contact,
            featured: body.featured ?? false,
        });

        return NextResponse.json(
            { message: "Place created successfully ✅", place: newPlace },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { error: error.message || "Something went wrong ❌" },
            { status: 500 }
        );
    }
}