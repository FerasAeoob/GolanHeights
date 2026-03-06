import { NextRequest, NextResponse } from "next/server";
import {v2 as cloudinary} from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import {createplaceschema} from "@/schemas/place.schema";


/* ======================
   GET ALL PLACES
====================== */
export async function GET() {
    try {
        await connectDB();

        const places = await Place.find().sort({ createdAt: -1 }).lean();

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

        if (!validation.success) { return NextResponse.json(
            { error: "validation failed ❌" },
            { status: 400 }
        )}
        const file = body.image as File;
        if (!file){return NextResponse.json(
            { error: "Image is required ❌" },
            { status: 400 }
        )}
        const uploadResult = await cloudinary.uploader.upload(body.image, {
            folder: "places",
            resource_type: "auto",
        });

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
    } catch (error) {
        const err = error as any;

        if(err.code == 11000){
            return NextResponse.json(
                { error: "Place with this title already exists ❌" },
                { status: 400 }
            );
        }


        return NextResponse.json(

            { error: err.errmsg || "Something went wrong ❌" },
            { status: 500 }
        );
    }
}