'use server';

import { cookies } from "next/headers";

// MAKE SURE 'export' IS HERE
export async function loginAction(formData: FormData) {
    const password = formData.get("password");
    const SYSTEM_PASSWORD = process.env.ADMIN_PASSWORD;

    if (password === SYSTEM_PASSWORD) {
        const cookieStore = await cookies();

        cookieStore.set("admin_session", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return { success: true };
    }

    return { error: "Invalid Password ❌" };
}

// Optional: Add this while you're here
export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
}