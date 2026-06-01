import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { registerSchema } from "@/database/user/user.schema";
import { serializeUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const registerLimiter = { name: "register", maxRequests: 3, windowSeconds: 60 * 60 };

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(registerLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { success: false, errorCode: "RATE_LIMITED" },
                { status: 429 }
            );
        }

        await connectDB();

        const body = await req.json();
        const validatedData = registerSchema.parse(body);

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

        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            image: validatedData.image || "",
            password: validatedData.password,
            role: "user",
            plan: "free",
            favorites: [],
        });



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