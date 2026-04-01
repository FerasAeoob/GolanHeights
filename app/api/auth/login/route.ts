import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { loginSchema } from "@/database/user/user.schema";
import { createUserToken, setAuthCookie, serializeUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const validatedData = loginSchema.parse(body);

        const user = await User.findOne({ email: validatedData.email });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isPasswordValid = await user.comparePassword(validatedData.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const token = await createUserToken(user);
        await setAuthCookie(token);

        return NextResponse.json(
            {
                success: true,
                message: "User logged in successfully",
                user: serializeUser(user),
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

        console.error("LOGIN ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}