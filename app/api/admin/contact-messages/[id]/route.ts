import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { requireRole } from "@/lib/permissions";

export const runtime = "nodejs";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole(["admin"]);
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid message ID" },
                { status: 400 }
            );
        }

        const body = await req.json();

        const updateData: any = {};
        
        if (body.status && ["new", "read", "archived"].includes(body.status)) {
            updateData.status = body.status;
        }
        
        if (body.adminNote !== undefined) {
            updateData.adminNote = body.adminNote;
        }

        const updatedMessage = await ContactMessage.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedMessage) {
            return NextResponse.json(
                { success: false, message: "Message not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedMessage });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        if (error.message === "Forbidden") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        
        console.error("[PATCH /api/admin/contact-messages/[id]] Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole(["admin"]);
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid message ID" },
                { status: 400 }
            );
        }

        // Soft delete / archive it
        const archivedMessage = await ContactMessage.findByIdAndUpdate(
            id,
            { $set: { status: "archived" } },
            { new: true }
        ).lean();

        if (!archivedMessage) {
            return NextResponse.json(
                { success: false, message: "Message not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Message archived successfully" });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        if (error.message === "Forbidden") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

        console.error("[DELETE /api/admin/contact-messages/[id]] Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
