import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import Place from "@/database/place.model";
import { requireAuth } from "@/lib/permissions";

export async function GET(req: NextRequest) {
    try {
        const currentUser = await requireAuth();
        await connectDB();


        const full = req.nextUrl.searchParams.get("full") === "true";


        let userQuery = User.findById(currentUser._id).select("favorites");

        if (full) {
            userQuery = userQuery.populate({
                path: "favorites",
                select: "title address",
            });
        }

        const user = await userQuery;

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, favorites: user.favorites },
            { status: 200 }
        );
    } catch (error: any) {
        if (error?.message === "Unauthorized") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        console.error("GET FAVORITES ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await requireAuth();

        const body = await req.json();
        const { placeId } = body;

        if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid placeId is required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const place = await Place.findById(placeId);

        if (!place) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Place not found",
                },
                { status: 404 }
            );
        }

        const user = await User.findByIdAndUpdate(
            currentUser._id,
            {
                $addToSet: { favorites: placeId },
            },
            { new: true }
        ).select("favorites");

        return NextResponse.json(
            {
                success: true,
                message: "Place added to favorites",
                favorites: user?.favorites || [],
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error?.message === "Unauthorized") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        console.error("ADD FAVORITE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const currentUser = await requireAuth();

        const body = await req.json();
        const { placeId } = body;

        if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid placeId is required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(
            currentUser._id,
            {
                $pull: { favorites: placeId },
            },
            { new: true }
        ).select("favorites");

        return NextResponse.json(
            {
                success: true,
                message: "Place removed from favorites",
                favorites: user?.favorites || [],
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error?.message === "Unauthorized") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        console.error("REMOVE FAVORITE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}