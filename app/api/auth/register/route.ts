import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { registerSchema } from "@/database/user/user.schema";
import { serializeUser } from "@/lib/auth";
import { checkSensitiveRateLimits, getClientIp, rateLimitKey } from "@/lib/rate-limit";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { getDictionary } from "@/lib/get-dictionary";

export const runtime = "nodejs";

const registerIpLimiter = { name: "auth:register:ip", maxRequests: 3, windowSeconds: 60 * 60 };
const registerEmailLimiter = { name: "auth:register:email", maxRequests: 3, windowSeconds: 60 * 60 };

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);
        const ip = getClientIp(req);
        const limit = await checkSensitiveRateLimits([
            { ...registerIpLimiter, key: rateLimitKey("ip", ip) },
            { ...registerEmailLimiter, key: rateLimitKey("email", validatedData.email) },
        ]);

        if (!limit.allowed) {
            return NextResponse.json(
                { success: false, errorCode: limit.reason === "configuration" ? "SERVER_ERROR" : "RATE_LIMITED" },
                { status: limit.reason === "configuration" ? 503 : 429 }
            );
        }

        await connectDB();

        const existingUser = await User.findOne({ email: validatedData.email });

        if (existingUser) {
            return NextResponse.json(
                { success: false, errorCode: "EMAIL_ALREADY_EXISTS" },
                { status: 409 }
            );
        }

        if (validatedData.phone) {
            const existingPhone = await User.findOne({ phone: validatedData.phone });
            if (existingPhone) {
                return NextResponse.json(
                    { success: false, errorCode: "PHONE_ALREADY_EXISTS", field: "phone" },
                    { status: 409 }
                );
            }
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            image: validatedData.image || "",
            password: validatedData.password,
            role: "user",
            plan: "free",
            favorites: [],
            emailVerificationToken: hashedToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        try {
            const url = new URL(req.url);
            const bodyLang = body.lang || "en";
            const reqLang = ["en", "ar", "he"].includes(bodyLang) ? bodyLang : "en";
            const baseUrl = process.env.APP_URL || url.origin;
            const verifyUrl = `${baseUrl}/${reqLang}/verify-email?token=${verificationToken}`;
            const dict = await getDictionary(reqLang);

            await sendVerificationEmail(user.email, verifyUrl, dict, reqLang);
        } catch (emailErr) {
            console.error("EMAIL_VERIFICATION_SEND_ERROR during registration:", emailErr);
            // Fault tolerance: do not break registration if sending email fails
        }

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
                user: serializeUser(user),
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (error?.name === "ZodError") {
            const firstIssue = error.issues[0];
            return NextResponse.json(
                {
                    success: false,
                    errorCode: firstIssue.message,
                    field: firstIssue.path[0],
                },
                { status: 400 }
            );
        }

        console.error("REGISTER ERROR:", error);

        return NextResponse.json(
            { success: false, errorCode: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
