import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { requireRole } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        await requireRole(["admin"]);
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const status = searchParams.get("status");
        const reason = searchParams.get("reason");
        const search = searchParams.get("search");

        const query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (reason && reason !== "all") {
            query.reason = reason;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            ContactMessage.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ContactMessage.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: messages,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "Forbidden") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }
        console.error("[GET /api/admin/contact-messages] Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
