import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { forgotPasswordSchema as emailSchema } from "@/database/user/user.schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { getDictionary } from "@/lib/get-dictionary";

export const runtime = "nodejs";

const sendVerificationLimiter = {
    name: "send-verification-email",
    maxRequests: 3,
    windowSeconds: 15 * 60,
};

export async function POST(req: NextRequest) {
    let dict: any = {};
    try {
        const body = await req.json();
        const lang = ["en", "ar", "he"].includes(body.lang) ? body.lang : "en";
        dict = await getDictionary(lang);

        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(sendVerificationLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes." },
                { status: 429 }
            );
        }

        await connectDB();
        const validatedData = emailSchema.parse(body);

        const user = await User.findOne({
            email: validatedData.email.toLowerCase(),
        });

        // We do not reveal if the email exists or not for security, but we only send if it exists and is not verified
        if (user && !user.isVerified) {
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

            user.emailVerificationToken = hashedToken;
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await user.save();

            const url = new URL(req.url);
            const reqLang = body.lang || "en";
            const baseUrl = process.env.APP_URL || url.origin;
            const verifyUrl = `${baseUrl}/${reqLang}/verify-email?token=${verificationToken}`;

            await sendVerificationEmail(user.email, verifyUrl, dict, reqLang);
        }

        return NextResponse.json(
            { success: true, message: dict?.auth?.verificationEmailSent || "If an account with this email exists and is not verified, a verification link has been sent." },
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
        console.error("SEND VERIFICATION EMAIL ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
