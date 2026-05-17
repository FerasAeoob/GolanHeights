import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { forgotPasswordSchema } from "@/database/user/user.schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/sendPasswordResetEmail";
import { getDictionary } from "@/lib/get-dictionary";

export const runtime = "nodejs";

const forgotPasswordLimiter =
{
    name: "forgot-password",
    maxRequests: 3,
    windowSeconds: 15 * 60
};

export async function POST(req: NextRequest) {
    let dict: any = {};
    try {
        const body = await req.json();
        const lang = body.lang || "en";
        dict = await getDictionary(lang);

        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(forgotPasswordLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes." },
                { status: 429 }
            );
        }

        await connectDB();
        const validatedData = forgotPasswordSchema.parse(body);

        const user = await User.findOne({
            email: validatedData.email.toLowerCase(),
        });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            await user.save();

            const url = new URL(req.url);
            const reqLang = body.lang || "en";
            const baseUrl = process.env.APP_URL || url.origin;
            const resetUrl = `${baseUrl}/${reqLang}/reset-password?token=${resetToken}`;

            await sendPasswordResetEmail(user.email, resetUrl);
        }

        return NextResponse.json(
            { success: true, message: dict?.auth?.genericResetEmailSent || "If an account with this email exists, we sent a reset link." },
            { status: 200 }
        );

    } catch (error: any) {
        if (error?.name === "ZodError") {
            const firstError = error.issues[0]?.message;
            let message = dict?.auth?.validationFailed || "Please check your input and try again.";

            if (firstError === "INVALID_EMAIL") {
                message = dict?.auth?.errors?.emailInvalid || "Please enter a valid email address";
            }

            return NextResponse.json(
                { success: false, message, field: error.issues[0]?.path[0] },
                { status: 400 }
            );
        }
        console.error("FORGOT PASSWORD ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
