import crypto from "crypto";

/**
 * Legacy in-memory rate limiter for non-sensitive local/simple routes.
 *
 * Sensitive routes should use checkSensitiveRateLimits(), which uses Upstash
 * Redis REST when configured and fails closed in production if it is missing.
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

type RateLimitKeyPart = string | number | boolean | null | undefined;

export interface SensitiveRateLimitRule extends RateLimitConfig {
    /** Unique key material for this rule. PII/secrets are hashed before storage. */
    key: string;
}

export type SensitiveRateLimitFailureReason = "limited" | "configuration";

export interface SensitiveRateLimitResult extends RateLimitResult {
    reason?: SensitiveRateLimitFailureReason;
}

let missingDistributedLimiterLogged = false;

function isProduction() {
    return process.env.NODE_ENV === "production";
}

function getDistributedLimiterConfig() {
    const url =
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.KV_REST_API_URL ||
        "";

    const token =
        process.env.UPSTASH_REDIS_REST_TOKEN ||
        process.env.KV_REST_API_TOKEN ||
        "";

    return { url, token };
}

function hasDistributedLimiter() {
    const { url, token } = getDistributedLimiterConfig();
    return Boolean(url && token);
}

function hashKey(key: string) {
    return crypto.createHash("sha256").update(key).digest("hex");
}

function storageKey(rule: SensitiveRateLimitRule) {
    return `rl:${rule.name}:${hashKey(rule.key)}`;
}

function logMissingDistributedLimiter() {
    if (missingDistributedLimiterLogged) return;
    missingDistributedLimiterLogged = true;
    console.error(
        "Sensitive rate limiting is not configured for production. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
}

async function redisPipeline(commands: unknown[][]) {
    const config = getDistributedLimiterConfig();
    const url = config.url.replace(/\/$/, "");
    const response = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("RATE_LIMIT_REDIS_ERROR");
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("RATE_LIMIT_REDIS_ERROR");
    }

    return data.map((item) => item?.result);
}

async function checkRedisRateLimit(rule: SensitiveRateLimitRule): Promise<RateLimitResult> {
    const key = storageKey(rule);
    const now = Date.now();
    const [countResult, , ttlResult] = await redisPipeline([
        ["INCR", key],
        ["EXPIRE", key, rule.windowSeconds, "NX"],
        ["TTL", key],
    ]);
    const count = Number(countResult);
    const ttl = Number(ttlResult);

    if (!Number.isFinite(count) || !Number.isFinite(ttl) || ttl < 0) {
        throw new Error("RATE_LIMIT_REDIS_ERROR");
    }

    const resetAt = now + ttl * 1000;
    const remaining = Math.max(rule.maxRequests - count, 0);

    return {
        allowed: count <= rule.maxRequests,
        remaining,
        resetAt,
    };
}

function checkDevelopmentRateLimit(rule: SensitiveRateLimitRule): RateLimitResult {
    return checkRateLimit(
        {
            name: rule.name,
            maxRequests: rule.maxRequests,
            windowSeconds: rule.windowSeconds,
        },
        storageKey(rule)
    );
}

export function rateLimitKey(...parts: RateLimitKeyPart[]) {
    return parts
        .map((part) => {
            if (part === null || part === undefined || part === "") return "missing";
            return String(part).trim().toLowerCase();
        })
        .join(":");
}

export async function checkSensitiveRateLimits(
    rules: SensitiveRateLimitRule[]
): Promise<SensitiveRateLimitResult> {
    const now = Date.now();

    if (rules.length === 0) {
        return { allowed: true, remaining: 0, resetAt: now };
    }

    if (!hasDistributedLimiter()) {
        if (isProduction()) {
            logMissingDistributedLimiter();
            return {
                allowed: false,
                remaining: 0,
                resetAt: now,
                reason: "configuration",
            };
        }

        for (const rule of rules) {
            const result = checkDevelopmentRateLimit(rule);
            if (!result.allowed) {
                return { ...result, reason: "limited" };
            }
        }

        return { allowed: true, remaining: 0, resetAt: now };
    }

    try {
        for (const rule of rules) {
            const result = await checkRedisRateLimit(rule);
            if (!result.allowed) {
                return { ...result, reason: "limited" };
            }
        }

        return { allowed: true, remaining: 0, resetAt: now };
    } catch {
        if (isProduction()) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: now,
                reason: "configuration",
            };
        }

        for (const rule of rules) {
            const result = checkDevelopmentRateLimit(rule);
            if (!result.allowed) {
                return { ...result, reason: "limited" };
            }
        }

        return { allowed: true, remaining: 0, resetAt: now };
    }
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
