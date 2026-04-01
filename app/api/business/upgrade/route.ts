import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { createBusinessSchema } from "@/database/user/user.schema";
import { requireRole } from "@/lib/permissions";

export async function POST(req: NextRequest) {
    try {
        await requireRole(["admin"]);

        const body = await req.json();
        const { userId, ...businessData } = body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid userId is required",
                },
                { status: 400 }
            );
        }

        const validatedData = createBusinessSchema.parse(businessData);

        await connectDB();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        if (user.role === "business") {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is already a business account",
                },
                { status: 409 }
            );
        }

        user.role = "business";
        user.business = {
            businessName: validatedData.businessName,
            website: validatedData.website,
            instagram: validatedData.instagram,
            verified: false,
        };

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "User upgraded to business successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error?.name === "ZodError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        if (error?.message === "Unauthorized") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        if (error?.message === "Forbidden") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden",
                },
                { status: 403 }
            );
        }

        console.error("BUSINESS UPGRADE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}