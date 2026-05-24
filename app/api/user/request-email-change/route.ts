import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { sendVerificationEmail, sendEmailChangeCodeEmail } from "@/lib/email/sendVerificationEmail";
import { getDictionary } from "@/lib/get-dictionary";
import { z } from "zod";

export const runtime = "nodejs";

const requestEmailChangeLimiter = {
    name: "request-email-change",
    maxRequests: 3,
    windowSeconds: 15 * 60,
};

const schema = z.object({
    newEmail: z.string().trim().toLowerCase().email("INVALID_EMAIL"),
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
        const newEmail = validatedData.newEmail;
        const lang = validatedData.lang;

        dict = await getDictionary(lang);

        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(requestEmailChangeLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, errorCode: "RATE_LIMITED", message: dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes." },
                { status: 429 }
            );
        }

        await connectDB();

        // Load fresh user from MongoDB first
        const user = await User.findById(currentUser._id);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Compare against loaded database user email
        if (newEmail === user.email.toLowerCase()) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: "NO_EMAIL_CHANGE",
                    message: dict?.settings?.noEmailChange || "This is already your current email address."
                },
                { status: 400 }
            );
        }

        // Check duplicate email
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

        if (!user.isVerified) {
            // Flow 1: Unverified - update immediately
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
        } else {
            // Flow 2: Verified - generate confirmation code
            const code = crypto.randomInt(100000, 1000000).toString();
            const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

            user.pendingEmail = newEmail;
            user.emailChangeCode = hashedCode;
            user.emailChangeCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await user.save();

            await sendEmailChangeCodeEmail(user.email, code, dict, lang);

            return NextResponse.json(
                {
                    success: true,
                    errorCode: "EMAIL_CHANGE_CODE_SENT",
                    message: dict?.settings?.emailChangeCodeSent || "We sent a confirmation code to your current email."
                },
                { status: 200 }
            );
        }

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
        console.error("REQUEST EMAIL CHANGE ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
