import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
    try {
        await clearAuthCookie();

        return NextResponse.json(
            {
                success: true,
                message: "User logged out successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
