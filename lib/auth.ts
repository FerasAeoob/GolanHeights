import 'server-only';
import { cache } from 'react';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import User, { IUser } from '@/database/user/user.model';
import connectDB from "@/lib/mongodb";
import { perfLog } from "@/lib/perf";

const COOKIE_NAME = "user_token";
type UserTokenPayload = JWTPayload & {
    userId: string;
    role: "user" | "business" | "admin";
    plan: "free" | "vip";
};

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    return new TextEncoder().encode(secret);
}

export function serializeUser(user: IUser) {
    return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        plan: user.plan,
        favorites: user.favorites.map((id) => id.toString()),
        business: user.business
            ? {
                businessName: user.business.businessName,
                website: user.business.website || "",
                instagram: user.business.instagram || "",
                verified: user.business.verified,
            }
            : undefined,
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),

    }

}

export async function createUserToken(user: IUser) {
    const secret = getJwtSecret();
    return await new SignJWT({
        userId: user._id.toString(),
        role: user.role,
        plan: user.plan,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(Date.now())
        .setExpirationTime("1h")
        .sign(secret);
}

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60,
        path: "/",
    });
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}

export async function getTokenPayload() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        if (!token) return null;
        const secret = getJwtSecret();
        const { payload } = await jwtVerify<UserTokenPayload>(token, secret);

        return payload;
    } catch (error: any) {
        if (error.code !== 'ERR_JWT_EXPIRED') {
            console.error("JWT Verification Error:", error.message || error);
        }
        return null;
    }
}

async function _getCurrentUser() {
    try {
        const t0 = performance.now();
        const payload = await getTokenPayload();
        const t1 = performance.now();
        if (!payload) {
            perfLog(`[PERF] getCurrentUser: no token (jwt: ${(t1 - t0).toFixed(1)}ms)`);
            return null;
        }
        await connectDB();
        const t2 = performance.now();
        const user = await User.findById(payload.userId)
            .select('_id name email phone image role plan favorites business createdAt updatedAt')
            .lean();
        const t3 = performance.now();
        perfLog(`[PERF] getCurrentUser: jwt=${((t1 - t0)).toFixed(1)}ms | db=${((t3 - t2)).toFixed(1)}ms | total=${((t3 - t0)).toFixed(1)}ms`);
        if (!user) return null;
        return serializeUser(user as IUser);
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Per-request memoized auth lookup.
 * React cache() ensures cookie parse + JWT verify + User.findById
 * runs at most ONCE per server render, even if called from multiple components.
 */
export const getCurrentUser = cache(_getCurrentUser);