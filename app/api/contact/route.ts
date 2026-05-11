import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactSchema } from "@/lib/validators/contact.validator";
import { createContactMessage } from "@/lib/services/contact.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const contactLimiter = {
    name: "contact",
    maxRequests: 5,
    windowSeconds: 10 * 60, // 5 requests per 10 minutes
};

export async function POST(req: NextRequest) {
    try {
        // ── Rate limiting ─────────────────────────────────────────────────────
        const ip = getClientIp(req);
        const { allowed } = checkRateLimit(contactLimiter, ip);

        if (!allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Too many messages sent. Please wait a few minutes before trying again.",
                },
                { status: 429 }
            );
        }

        // ── Parse body safely ─────────────────────────────────────────────────
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid request body." },
                { status: 400 }
            );
        }

        // ── Validate ──────────────────────────────────────────────────────────
        const input = contactSchema.parse(body);

        // ── Persist ───────────────────────────────────────────────────────────
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
                    errors: error.issues.map((i) => ({
                        field: i.path[0],
                        message: i.message,
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
