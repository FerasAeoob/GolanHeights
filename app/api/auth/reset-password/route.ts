import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { resetPasswordSchema } from "@/database/user/user.schema";
import { checkSensitiveRateLimits, getClientIp, rateLimitKey } from "@/lib/rate-limit";
import crypto from "crypto";
import { getDictionary } from "@/lib/get-dictionary";

export const runtime = "nodejs";

const resetPasswordIpLimiter = { name: "auth:reset-password:ip", maxRequests: 5, windowSeconds: 15 * 60 };
const resetPasswordTokenLimiter = { name: "auth:reset-password:token", maxRequests: 3, windowSeconds: 15 * 60 };

export async function POST(req: NextRequest) {
    let dict: any = {};
    try {
        const body = await req.json();
        const lang = ["en", "ar", "he"].includes(body.lang) ? body.lang : "en";
        dict = await getDictionary(lang);

        const validatedData = resetPasswordSchema.parse(body);

        const ip = getClientIp(req);
        const limit = await checkSensitiveRateLimits([
            { ...resetPasswordIpLimiter, key: rateLimitKey("ip", ip) },
            { ...resetPasswordTokenLimiter, key: rateLimitKey("token", validatedData.token) },
        ]);

        if (!limit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: limit.reason === "configuration"
                        ? (dict?.auth?.unknownError || "An unexpected error occurred. Please try again later.")
                        : (dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes.")
                },
                { status: limit.reason === "configuration" ? 503 : 429 }
            );
        }

        await connectDB();

        const hashedToken = crypto.createHash("sha256").update(validatedData.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.invalidToken || "The password reset link is invalid or expired." },
                { status: 400 }
            );
        }

        user.password = validatedData.password;
        user.tokenInvalidBefore = new Date();
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json(
            { success: true, message: dict?.auth?.passwordResetSuccess || "Password updated successfully." },
            { status: 200 }
        );

    } catch (error: any) {
        if (error?.name === "ZodError") {
            const firstError = error.issues[0]?.message;
            let message = dict?.auth?.validationFailed || "Please check your input and try again.";
            let field = error.issues[0]?.path[0];

            if (firstError === "TOKEN_REQUIRED") message = dict?.auth?.tokenRequired || "Reset token is required.";
            if (firstError === "PASSWORD_TOO_SHORT") message = dict?.auth?.passwordTooShort || "Password must be at least 8 characters.";
            if (firstError === "PASSWORDS_DO_NOT_MATCH") message = dict?.auth?.passwordsDoNotMatch || "Passwords do not match.";

            return NextResponse.json(
                { success: false, message, field },
                { status: 400 }
            );
        }
        console.error("RESET PASSWORD ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
