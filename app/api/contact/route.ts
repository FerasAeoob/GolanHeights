import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactSchema } from "@/lib/validators/contact.validator";
import { createContactMessage } from "@/lib/services/contact.service";
import { checkSensitiveRateLimits, getClientIp, rateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const contactLimiter = {
    name: "contact:ip",
    maxRequests: 5,
    windowSeconds: 10 * 60,
};

const contactEmailLimiter = {
    name: "contact:email",
    maxRequests: 3,
    windowSeconds: 10 * 60,
};

export async function POST(req: NextRequest) {
    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid request body." },
                { status: 400 }
            );
        }

        const input = contactSchema.parse(body);
        const ip = getClientIp(req);
        const limit = await checkSensitiveRateLimits([
            { ...contactLimiter, key: rateLimitKey("ip", ip) },
            { ...contactEmailLimiter, key: rateLimitKey("email", input.email) },
        ]);

        if (!limit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: limit.reason === "configuration"
                        ? "Something went wrong. Please try again later."
                        : "Too many messages sent. Please wait a few minutes before trying again.",
                },
                { status: limit.reason === "configuration" ? 503 : 429 }
            );
        }

        const userAgent = req.headers.get("user-agent") ?? undefined;
        await createContactMessage(input, { ip, userAgent });

        return NextResponse.json(
            { success: true, message: "Your message has been received. We will get back to you soon." },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            const firstIssue = error.issues[0];
            return NextResponse.json(
                {
                    success: false,
                    message: firstIssue?.message ?? "Validation failed.",
                    errors: error.issues.map((issue) => ({
                        field: issue.path[0],
                        message: issue.message,
                    })),
                },
                { status: 422 }
            );
        }

        console.error("[POST /api/contact] Unhandled error:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again later." },
            { status: 500 }
        );
    }
}
