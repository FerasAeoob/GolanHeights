import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/database/place.model";
import { createplaceschema } from "@/database/place.schema";
import { getCurrentUser } from "@/lib/auth";
import { isOwner } from "@/lib/permissions";
import { toPublicPlaceDTO } from "@/lib/db/places";

export const dynamic = "force-dynamic";

/* ======================
   GET ALL PLACES
====================== */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category")?.trim().toLowerCase();
        const sort = searchParams.get("sort")?.trim().toLowerCase();

        const query: { category?: string; hidden?: any } = {
            hidden: { $ne: true }
        };

        if (category && category !== "all") {
            query.category = category;
        }

        let sortOption: Record<string, 1 | -1> = { createdAt: -1 };

        if (sort === "top-rated") {
            sortOption = {
                averageRating: -1,
                reviewsCount: -1,
            };
        }

        const places = await Place.find(query)
            .sort(sortOption)
            .lean();

        const safePlaces = places.map(toPublicPlaceDTO);

        return NextResponse.json(safePlaces, { status: 200 });

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
        const user = await getCurrentUser();
        if (!isOwner(user)) {
            return NextResponse.json(
                { error: "Forbidden: Owner Access Required ❌" },
                { status: 403 }
            );
        }


        await connectDB();

        const body = await req.json();

        const validation = createplaceschema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.format() },
                { status: 400 }
            );
        }

        const validatedPlace = validation.data;

        const newPlace = await Place.create({
            title: validatedPlace.title,
            description: validatedPlace.description,
            shortDescription: validatedPlace.shortDescription,
            category: validatedPlace.category,
            images: validatedPlace.images,
            location: validatedPlace.location,
            contact: validatedPlace.contact,
            open: validatedPlace.open,
            duration: validatedPlace.duration,
            price: validatedPlace.price,
            mapLink: validatedPlace.mapLink,
            featured: validatedPlace.featured ?? false
        });

        return NextResponse.json(
            { message: "Place created successfully ✅", place: toPublicPlaceDTO(newPlace) },
            { status: 201 }
        );

    } catch (error: any) {

        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Place with this title already exists ❌" },
                { status: 400 }
            );
        }

        console.error("CREATE PLACE ERROR:", error);

        return NextResponse.json(
            { success: false, errorCode: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}