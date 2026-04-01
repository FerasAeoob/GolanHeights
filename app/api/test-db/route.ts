import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";

export async function GET() {
    try {
        await connectDB();

        // Try simple DB action
        const count = await User.countDocuments();

        return NextResponse.json({
            success: true,
            message: "DB connected",
            usersCount: count,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "DB failed" },
            { status: 500 }
        );
    }
}