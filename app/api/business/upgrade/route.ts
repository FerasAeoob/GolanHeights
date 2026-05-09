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
            const firstIssue = error.issues[0];
            return NextResponse.json(
                { success: false, errorCode: firstIssue.message, field: firstIssue.path[0] },
                { status: 400 }
            );
        }

        if (error?.message === "Unauthorized") {
            return NextResponse.json({ success: false, errorCode: "UNAUTHORIZED" }, { status: 401 });
        }

        if (error?.message === "Forbidden") {
            return NextResponse.json({ success: false, errorCode: "FORBIDDEN" }, { status: 403 });
        }

        console.error("BUSINESS UPGRADE ERROR:", error);

        return NextResponse.json(
            { success: false, errorCode: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}