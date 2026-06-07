import { getCurrentUser } from "./auth";

type UserIdentity = {
    _id?: unknown;
    id?: unknown;
    role?: string;
} | null | undefined;


export class EmailNotVerifiedError extends Error {
    constructor(message = "EmailNotVerified") {
        super(message);
        this.name = "EmailNotVerifiedError";
    }
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    return user;
}

export async function requireVerifiedUser() {
    const user = await requireAuth();
    if (!user.isVerified) {
        throw new EmailNotVerifiedError();
    }
    return user;
}
export async function requireRole(allowedRoles: Array<"user" | "admin" | "business">) {
    const user = await requireAuth();
    if (!allowedRoles.includes(user.role)) {
        throw new Error("Forbidden");
    }

    return user;

}
export function isAdmin(user: any) {
    return user?.role === "admin";
}

function normalizeUserId(value: unknown): string | null {
    if (!value) return null;
    if (typeof value === "string") return value.trim() || null;

    const toString = (value as { toString?: () => string }).toString;
    if (typeof toString === "function") {
        const id = toString.call(value).trim();
        return id && id !== "[object Object]" ? id : null;
    }

    return null;
}

export function isOwner(user: UserIdentity) {
    const ownerUserId = process.env.OWNER_USER_ID?.trim();
    if (!ownerUserId) return false;

    const userId = normalizeUserId(user?._id) || normalizeUserId(user?.id);
    return userId === ownerUserId;
}

export function canEditArea51(user: any) {
    return isAdmin(user);
}

export function canAddArea51(user: any) {
    return isOwner(user);
}

export function canDeleteArea51(user: any) {
    return isOwner(user);
}
