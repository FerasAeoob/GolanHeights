import 'server-only';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import User, { IUser } from '@/database/user/user.model';
import connectDB from "@/lib/mongodb";

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
        .setExpirationTime("7d")
        .sign(secret);
}

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
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
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getCurrentUser() {
    try {
        const payload = await getTokenPayload();
        if (!payload) return null;
        await connectDB();
        const user = await User.findById(payload.userId);
        if (!user) return null;
        return serializeUser(user);
    } catch (error) {
        console.error(error);
        return null;
    }
}