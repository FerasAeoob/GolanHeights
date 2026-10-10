"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions";
import { checkSensitiveRateLimits, rateLimitKey } from "@/lib/rate-limit";
import { placeOrderInputSchema, type PlaceOrderItem } from "@/lib/place-order";
import { persistPlaceOrder, readPlaceOrder } from "@/lib/db/place-order";

function errorResult(error: unknown): { errorCode: string } {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return { errorCode: "UNAUTHORIZED" };
    if (message === "Forbidden") return { errorCode: "FORBIDDEN" };
    if (message === "ORDER_CONFLICT") return { errorCode: "ORDER_CONFLICT" };
    return { errorCode: "UNKNOWN_ERROR" };
}

export async function getPlaceOrderAction(): Promise<{ places: PlaceOrderItem[]; revision: string } | { errorCode: string }> {
    try {
        await requireRole(["admin"]);
        return await readPlaceOrder();
    } catch (error) {
        return errorResult(error);
    }
}

// Invoked as a Server Action: retain Next's POST/origin checks and the existing
// serverActions.allowedOrigins configuration, in addition to database-backed auth.
export async function savePlaceOrderAction(input: unknown): Promise<{ success: true; revision: string } | { errorCode: string }> {
    try {
        const user = await requireRole(["admin"]);
        // Like admin image uploads, explicitly fail closed: the shared legacy
        // limiter falls back to process-local memory when configuration is absent.
        if (process.env.NODE_ENV === "production" && !(
            (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
            (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
        )) return { errorCode: "UNKNOWN_ERROR" };
        const limiter = await checkSensitiveRateLimits([{
            name: "admin-place-order", key: rateLimitKey(user._id), maxRequests: 20, windowSeconds: 60,
        }]);
        if (!limiter.allowed) return { errorCode: "RATE_LIMITED" };
        const parsed = placeOrderInputSchema.safeParse(input);
        if (!parsed.success) return { errorCode: "VALIDATION_FAILED" };
        const revision = await persistPlaceOrder(parsed.data.ids, parsed.data.revision);
        revalidatePath("/[lang]/places", "page");
        revalidatePath("/[lang]/area-51-sec/place-order", "page");
        return { success: true, revision };
    } catch (error) {
        return errorResult(error);
    }
}
