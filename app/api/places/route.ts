import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { createplaceschema } from "@/database/place.schema";


/* ======================
   GET ALL PLACES
====================== */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category")?.trim().toLowerCase();


        const query: { category?: string } = {};

        if (category && category !== "all") {
            query.category = category;
        }

        const places = await Place.find(query)
            .sort({ createdAt: -1 })
            .lean();


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

        const validation = createplaceschema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.format() },
                { status: 400 }
            );
        }

        const newPlace = await Place.create({
            title: body.title,
            description: body.description,
            shortDescription: body.shortDescription,
            category: body.category,
            images: body.images,
            location: body.location,
            contact: body.contact,
            openHours: body.openHours,
            rating: body.rating,
            duration: body.duration,
            price: body.price,
            mapLink: body.mapLink,
            featured: body.featured ?? false
        });

        return NextResponse.json(
            { message: "Place created successfully ✅", place: newPlace },
            { status: 201 }
        );

    } catch (error: any) {

        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Place with this title already exists ❌" },
                { status: 400 }
            );
        }

        console.error(error);

        return NextResponse.json(
            { error: error.message || "Something went wrong ❌" },
            { status: 500 }
        );
    }
}