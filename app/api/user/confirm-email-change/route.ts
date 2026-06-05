import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { checkSensitiveRateLimits, getClientIp, rateLimitKey } from "@/lib/rate-limit";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { getDictionary } from "@/lib/get-dictionary";
import { z } from "zod";

export const runtime = "nodejs";

const confirmEmailChangeLimiter = {
    name: "user:confirm-email-change:ip",
    maxRequests: 10,
    windowSeconds: 15 * 60,
};

const confirmEmailChangeUserLimiter = {
    name: "user:confirm-email-change:user",
    maxRequests: 5,
    windowSeconds: 15 * 60,
};

const schema = z.object({
    code: z.string().trim().length(6, "INVALID_CODE"),
    lang: z.enum(["en", "ar", "he"]).default("en"),
});

export async function POST(req: NextRequest) {
    let dict: any = {};
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validatedData = schema.parse(body);
        const code = validatedData.code;
        const lang = validatedData.lang;

        dict = await getDictionary(lang);

        const ip = getClientIp(req);
        const limit = await checkSensitiveRateLimits([
            { ...confirmEmailChangeLimiter, key: rateLimitKey("ip", ip) },
            { ...confirmEmailChangeUserLimiter, key: rateLimitKey("user", currentUser._id) },
        ]);

        if (!limit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: limit.reason === "configuration" ? "SERVER_ERROR" : "RATE_LIMITED",
                    message: limit.reason === "configuration"
                        ? (dict?.auth?.unknownError || "An unexpected error occurred. Please try again later.")
                        : (dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes.")
                },
                { status: limit.reason === "configuration" ? 503 : 429 }
            );
        }

        await connectDB();

        // Load including secret fields
        const user = await User.findById(currentUser._id).select("+pendingEmail +emailChangeCode +emailChangeCodeExpires");
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (!user.emailChangeCode || !user.pendingEmail) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "INVALID_EMAIL_CHANGE_CODE",
                    message: dict?.settings?.invalidEmailChangeCode || "Invalid or no email change request exists."
                },
                { status: 400 }
            );
        }

        const hashedSubmittedCode = crypto.createHash("sha256").update(code).digest("hex");
        if (user.emailChangeCode !== hashedSubmittedCode) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "INVALID_EMAIL_CHANGE_CODE",
                    message: dict?.settings?.invalidEmailChangeCode || "The confirmation code you entered is incorrect."
                },
                { status: 400 }
            );
        }

        if (user.emailChangeCodeExpires && user.emailChangeCodeExpires < new Date()) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "EMAIL_CHANGE_CODE_EXPIRED",
                    message: dict?.settings?.emailChangeCodeExpired || "The confirmation code has expired. Please request a new one."
                },
                { status: 400 }
            );
        }

        const newEmail = user.pendingEmail;

        // Re-check duplicate email before saving
        const duplicateUser = await User.findOne({
            email: newEmail,
            _id: { $ne: user._id },
        });

        if (duplicateUser) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "EMAIL_ALREADY_EXISTS",
                    message: dict?.settings?.emailAlreadyExists || "This email is already in use by another account."
                },
                { status: 409 }
            );
        }

        // Perform final update
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        user.email = newEmail;
        user.isVerified = false;
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.pendingEmail = undefined;
        user.emailChangeCode = undefined;
        user.emailChangeCodeExpires = undefined;

        await user.save();

        const url = new URL(req.url);
        const baseUrl = process.env.APP_URL || url.origin;
        const verifyUrl = `${baseUrl}/${lang}/verify-email?token=${verificationToken}`;

        await sendVerificationEmail(newEmail, verifyUrl, dict, lang);

        return NextResponse.json(
            {
                success: true,
                email: user.email,
                errorCode: "EMAIL_UPDATED_VERIFICATION_SENT",
                message: dict?.settings?.emailUpdatedVerificationSent || "Email updated. We sent a verification link to your new email."
            },
            { status: 200 }
        );

    } catch (error: any) {
        if (error?.name === "ZodError") {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "INVALID_EMAIL_CHANGE_CODE",
                    message: dict?.settings?.invalidEmailChangeCode || "Please enter a valid 6-digit confirmation code."
                },
                { status: 400 }
            );
        }
        console.error("CONFIRM EMAIL CHANGE ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
