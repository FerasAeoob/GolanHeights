import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { getDictionary } from "@/lib/get-dictionary";
import { z } from "zod";

export const runtime = "nodejs";

const verifyEmailLimiter = {
    name: "verify-email",
    maxRequests: 5,
    windowSeconds: 15 * 60,
};

const verifyEmailSchema = z.object({
    token: z.string().min(1, "TOKEN_REQUIRED"),
});

export async function POST(req: NextRequest) {
    let dict: any = {};
    try {
        const body = await req.json();
        const lang = ["en", "ar", "he"].includes(body.lang) ? body.lang : "en";
        dict = await getDictionary(lang);

        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(verifyEmailLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.rateLimited || "You have made too many attempts. Please wait 15 minutes." },
                { status: 429 }
            );
        }

        await connectDB();
        const validatedData = verifyEmailSchema.parse(body);

        const hashedToken = crypto.createHash("sha256").update(validatedData.token).digest("hex");

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: dict?.auth?.invalidVerificationToken || "Invalid or expired verification token." },
                { status: 400 }
            );
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return NextResponse.json(
            { success: true, message: dict?.auth?.emailVerified || "Email successfully verified!" },
            { status: 200 }
        );

    } catch (error: any) {
        if (error?.name === "ZodError") {
            return NextResponse.json(
                { success: false, message: dict?.auth?.invalidVerificationToken || "Invalid or expired verification token." },
                { status: 400 }
            );
        }
        console.error("VERIFY EMAIL ERROR:", error);
        return NextResponse.json(
            { success: false, message: dict?.auth?.unknownError || "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
