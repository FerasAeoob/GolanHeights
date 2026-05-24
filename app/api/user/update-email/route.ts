import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { getDictionary } from "@/lib/get-dictionary";
import { z } from "zod";

export const runtime = "nodejs";

const updateEmailLimiter = {
    name: "update-email",
    maxRequests: 5,
    windowSeconds: 15 * 60,
};

const schema = z.object({
    email: z.string().trim().toLowerCase().email("INVALID_EMAIL"),
    lang: z.enum(["en", "ar", "he"]),
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
        const lang = ["en", "ar", "he"].includes(body.lang) ? body.lang : "en";
        dict = await getDictionary(lang);

        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(updateEmailLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes." },
                { status: 429 }
            );
        }

        const validatedData = schema.parse(body);
        const newEmail = validatedData.email;

        // If same as current email, return no-change message cleanly
        if (newEmail === currentUser.email.toLowerCase()) {
            return NextResponse.json(
                {
                    success: true,
                    noChange: true,
                    message: dict?.settings?.noEmailChange || "This is already your current email address."
                },
                { status: 200 }
            );
        }

        await connectDB();

        // Check duplicate email against other users
        const duplicateUser = await User.findOne({
            email: newEmail,
            _id: { $ne: currentUser._id },
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

        // Fetch User model instance to update (lean query from getCurrentUser doesn't have save method)
        const user = await User.findById(currentUser._id);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        user.email = newEmail;
        user.isVerified = false;
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        const url = new URL(req.url);
        const baseUrl = process.env.APP_URL || url.origin;
        const verifyUrl = `${baseUrl}/${lang}/verify-email?token=${verificationToken}`;

        await sendVerificationEmail(newEmail, verifyUrl, dict, lang);

        return NextResponse.json(
            {
                success: true,
                message: dict?.settings?.emailUpdatedVerificationSent || "Email updated. We sent a verification link to your new email."
            },
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
        console.error("UPDATE EMAIL ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
