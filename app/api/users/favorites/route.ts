import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import Place from "@/database/place.model";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
    try {
        const currentUser = await requireAuth();
        await connectDB();

        const user = await User.findById(currentUser._id).populate("favorites").select("favorites");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Favorites fetched successfully",

        },
            { status: 200 });
    } catch (error: any) {
        if (error?.message === "Unauthorized") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        console.error("GET FAVORITES ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}