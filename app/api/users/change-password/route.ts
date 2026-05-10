import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { getCurrentUser } from "@/lib/auth";
import { changePasswordSchema } from "@/database/user/user.schema";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const passwordLimiter = { name: "change-password", maxRequests: 5, windowSeconds: 60 * 60 };

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { success: false, errorCode: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const { allowed } = checkRateLimit(passwordLimiter, currentUser._id);
        if (!allowed) {
            return NextResponse.json(
                { success: false, errorCode: "RATE_LIMITED" },
                { status: 429 }
            );
        }

        const body = await req.json();
        const validatedData = changePasswordSchema.parse(body);

        await connectDB();

        const user = await User.findById(currentUser._id);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "USER_NOT_FOUND",
                },
                { status: 404 }
            );
        }

        const isPasswordCorrect = await user.comparePassword(
            validatedData.currentPassword
        );

        if (!isPasswordCorrect) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "CURRENT_PASSWORD_INCORRECT",
                },
                { status: 401 }
            );
        }
        if (validatedData.newPassword === validatedData.currentPassword) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "NEW_PASSWORD_SAME_AS_CURRENT",
                },
                { status: 400 }
            );
        }

        user.password = validatedData.newPassword;
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Password changed successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error?.name === "ZodError") {
            const firstIssue = error.issues[0];
            return NextResponse.json(
                {
                    success: false,
                    errorCode: firstIssue.message,
                    field: firstIssue.path[0],
                },
                { status: 400 }
            );
        }

        console.error("CHANGE PASSWORD ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                errorCode: "UNKNOWN_ERROR",
            },
            { status: 500 }
        );
    }
}