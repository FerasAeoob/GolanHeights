/**
 * Simple in-memory rate limiter for Next.js API routes.
 * 
 * For production at scale, replace with @upstash/ratelimit + Redis.
 * This implementation is safe for single-instance deployments (Vercel serverless
 * functions share memory within a single instance's lifetime).
 * 
 * Stale entries are cleaned up automatically every 60 seconds.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Cleanup stale entries every 60 seconds
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [, store] of stores) {
            for (const [key, entry] of store) {
                if (now > entry.resetAt) {
                    store.delete(key);
                }
            }
        }
    }, 60_000);
    // Don't block process exit
    if (cleanupInterval.unref) cleanupInterval.unref();
}

interface RateLimitConfig {
    /** Unique name for this limiter (e.g. "login", "register") */
    name: string;
    /** Maximum number of requests allowed in the window */
    maxRequests: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check if a request is within the rate limit.
 * 
 * @param config - Rate limit configuration
 * @param key - Unique identifier (IP address, user ID, etc.)
 * @returns Whether the request is allowed
 */
export function checkRateLimit(config: RateLimitConfig, key: string): RateLimitResult {
    ensureCleanup();

    if (!stores.has(config.name)) {
        stores.set(config.name, new Map());
    }

    const store = stores.get(config.name)!;
    const now = Date.now();
    const entry = store.get(key);

    // No existing entry or window expired — allow and start new window
    if (!entry || now > entry.resetAt) {
        const resetAt = now + config.windowSeconds * 1000;
        store.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: config.maxRequests - 1, resetAt };
    }

    // Within window — check count
    if (entry.count < config.maxRequests) {
        entry.count++;
        return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
    }

    // Rate limited
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
}

/**
 * Extract client IP from a NextRequest.
 * Works on Vercel (x-forwarded-for) and local dev.
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}
