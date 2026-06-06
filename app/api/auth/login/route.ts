import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { loginSchema } from "@/database/user/user.schema";
import { createUserToken, setAuthCookie, serializeUser } from "@/lib/auth";
import { checkSensitiveRateLimits, getClientIp, rateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const loginIpLimiter = { name: "auth:login:ip", maxRequests: 20, windowSeconds: 15 * 60 };
const loginEmailLimiter = { name: "auth:login:email", maxRequests: 5, windowSeconds: 15 * 60 };

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = loginSchema.parse(body);
        const ip = getClientIp(req);
        const limit = await checkSensitiveRateLimits([
            { ...loginIpLimiter, key: rateLimitKey("ip", ip) },
            { ...loginEmailLimiter, key: rateLimitKey("email", validatedData.email) },
        ]);

        if (!limit.allowed) {
            if (limit.reason === "configuration") {
                return NextResponse.json(
                    { success: false, errorCode: "SERVER_ERROR" },
                    { status: 503 }
                );
            }

            const now = Date.now();
            const resetAt = limit.resetAt || (now + 15 * 60 * 1000);
            const retryAfter = Math.ceil(Math.max((resetAt - now) / 1000, 1));

            return NextResponse.json(
                {
                    success: false,
                    error: "TOO_MANY_ATTEMPTS",
                    errorCode: "RATE_LIMITED",
                    message: "Too many login attempts. Please try again later.",
                    resetAt,
                    retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                    },
                }
            );
        }

        await connectDB();

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

        // Clear any outstanding password reset tokens
        await User.updateOne(
            { _id: user._id },
            { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
        );

        const token = await createUserToken(user, validatedData.rememberMe);
        await setAuthCookie(token, validatedData.rememberMe);

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
