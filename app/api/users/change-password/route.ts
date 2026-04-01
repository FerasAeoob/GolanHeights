import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { getCurrentUser } from "@/lib/auth";
import { changePasswordSchema } from "@/database/user/user.schema";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
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
                    message: "User not found",
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
                    message: "Current password is incorrect",
                },
                { status: 401 }
            );
        }
        if (validatedData.newPassword === validatedData.currentPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "New password cannot be the same as current password",
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
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        console.error("CHANGE PASSWORD ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}