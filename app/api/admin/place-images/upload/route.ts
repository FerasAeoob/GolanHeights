import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireRole } from "@/lib/permissions";
import { checkSensitiveRateLimits } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024;

function failure(errorCode: string, status: number, headers?: HeadersInit) {
    return NextResponse.json({ success: false, errorCode }, { status, headers });
}

function hasProductionRateLimitConfig() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    return Boolean(url?.trim() && token?.trim());
}

function matchesImageSignature(bytes: Uint8Array, mime: string) {
    if (mime === "image/jpeg") {
        return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }
    if (mime === "image/png") {
        const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        return signature.every((byte, index) => bytes[index] === byte);
    }
    if (mime === "image/webp") {
        return bytes.length >= 12 &&
            bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
            bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    }
    return false;
}

/** Bound the stream before multipart parsing, including requests without Content-Length. */
async function readBoundedBody(req: NextRequest): Promise<Uint8Array<ArrayBuffer> | null> {
    if (!req.body) return new Uint8Array();
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.byteLength;
            if (length > MAX_BODY_BYTES) {
                // Cancellation failures must not turn an oversized body into another response.
                await reader.cancel().catch(() => undefined);
                return null;
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return body;
}

export async function POST(req: NextRequest) {
    let user: Awaited<ReturnType<typeof requireRole>>;
    try {
        user = await requireRole(["admin"]);
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return failure("UNAUTHORIZED", 401);
        }
        if (error instanceof Error && error.message === "Forbidden") {
            return failure("FORBIDDEN", 403);
        }
        return failure("UPLOAD_UNAVAILABLE", 503);
    }

    // A custom header prevents cross-origin HTML forms; no CORS permission is granted.
    const origin = req.headers.get("origin");
    // Next.js can construct nextUrl with an internal hostname behind a proxy.
    // Use the external host, as Next's Server Actions guard does, and its protocol.
    const host = req.headers.get("x-forwarded-host")?.split(",")[0].trim()
        || req.headers.get("host") || req.nextUrl.host;
    const protocol = req.headers.get("x-forwarded-proto")?.split(",")[0].trim()
        || req.nextUrl.protocol.slice(0, -1);
    if (req.headers.get("x-requested-with") !== "PlaceForm" ||
        (origin !== null && origin !== `${protocol}://${host}`) ||
        req.headers.get("sec-fetch-site") === "cross-site") {
        return failure("INVALID_REQUEST", 400);
    }

    // The shared limiter currently falls back to memory when credentials are missing.
    // Privileged uploads must fail closed in production instead.
    if (process.env.NODE_ENV === "production" && !hasProductionRateLimitConfig()) {
        return failure("UPLOAD_UNAVAILABLE", 503);
    }
    try {
        const limit = await checkSensitiveRateLimits([{
            name: "admin-place-image-upload",
            key: String(user._id),
            maxRequests: 60,
            windowSeconds: 60 * 60,
        }]);
        if (!limit.allowed) {
            if (limit.reason === "configuration") return failure("UPLOAD_UNAVAILABLE", 503);
            const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
            return failure("RATE_LIMITED", 429, { "Retry-After": String(retryAfter) });
        }
    } catch {
        return failure("UPLOAD_UNAVAILABLE", 503);
    }

    const contentType = req.headers.get("content-type") || "";
    if (!/^multipart\/form-data\s*;/i.test(contentType)) {
        return failure("INVALID_REQUEST", 400);
    }
    const contentLength = req.headers.get("content-length");
    if (contentLength !== null) {
        if (!/^\d+$/.test(contentLength)) return failure("INVALID_REQUEST", 400);
        if (Number(contentLength) > MAX_BODY_BYTES) return failure("PLACE_IMAGE_TOO_LARGE", 413);
    }

    let formData: FormData;
    try {
        const body = await readBoundedBody(req);
        if (body === null) return failure("PLACE_IMAGE_TOO_LARGE", 413);
        formData = await new Response(body, {
            headers: { "Content-Type": contentType },
        }).formData();
    } catch {
        return failure("INVALID_REQUEST", 400);
    }

    const images = formData.getAll("image");
    const files = [...formData.values()].filter((entry) => typeof entry !== "string");
    if (images.length > 1 || files.length > 1) return failure("INVALID_REQUEST", 400);
    if (images.length === 0) return failure("IMAGE_REQUIRED", 400);
    const file = images[0];
    if (typeof file === "string") return failure("INVALID_REQUEST", 400);
    if (file.size === 0) return failure("IMAGE_REQUIRED", 400);
    if (file.size > MAX_FILE_BYTES) return failure("PLACE_IMAGE_TOO_LARGE", 413);

    let bytes: Uint8Array;
    try {
        bytes = new Uint8Array(await file.arrayBuffer());
    } catch {
        return failure("INVALID_REQUEST", 400);
    }
    if (!matchesImageSignature(bytes, file.type)) return failure("INVALID_IMAGE_FORMAT", 400);

    try {
        // The SDK reads the repository's existing server-side CLOUDINARY_URL setting.
        const config = cloudinary.config();
        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            return failure("UPLOAD_UNAVAILABLE", 503);
        }
    } catch {
        return failure("UPLOAD_UNAVAILABLE", 503);
    }

    try {
        const result = await cloudinary.uploader.upload(
            `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`,
            {
                resource_type: "image",
                folder: "golan-places/admin",
                unique_filename: true,
                overwrite: false,
                format: "webp",
                transformation: [{ width: 2560, height: 2560, crop: "limit", quality: "auto" }],
            },
        );
        if (!result.secure_url || new URL(result.secure_url).protocol !== "https:") {
            return failure("UPLOAD_FAILED", 502);
        }
        return NextResponse.json({ success: true, imageUrl: result.secure_url });
    } catch {
        // Upstream errors can contain signed URLs or credentials; return only a stable code.
        return failure("UPLOAD_FAILED", 502);
    }
}
