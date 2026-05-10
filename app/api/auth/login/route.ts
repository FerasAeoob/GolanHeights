import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { loginSchema } from "@/database/user/user.schema";
import { createUserToken, setAuthCookie, serializeUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const loginLimiter = { name: "login", maxRequests: 5, windowSeconds: 15 * 60 };

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(loginLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, errorCode: "RATE_LIMITED" },
                { status: 429 }
            );
        }

        await connectDB();

        const body = await req.json();
        const validatedData = loginSchema.parse(body);

        const user = await User.findOne({ email: validatedData.email });

        if (!user) {
            return NextResponse.json(
                { success: false, errorCode: "INVALID_CREDENTIALS" },
                { status: 401 }
            );
        }

        const isPasswordValid = await user.comparePassword(validatedData.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, errorCode: "INVALID_CREDENTIALS" },
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
                    errorCode: "VALIDATION_FAILED",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        console.error("LOGIN ERROR:", error);

        return NextResponse.json(
            { success: false, errorCode: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}