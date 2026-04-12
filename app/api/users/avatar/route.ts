import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/database/user/user.model";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("avatar") as File | null;

        if (!file || !file.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, message: "No valid image provided" },
                { status: 400 }
            );
        }

        // Convert File to base64 for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64, {
            folder: "golan-avatars",
            public_id: `user_${currentUser._id}`,
            overwrite: true,
            transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
                { quality: "auto", fetch_format: "webp" },
            ],
        });

        // Update user in DB
        await connectDB();
        await User.findByIdAndUpdate(currentUser._id, {
            $set: { image: uploadResult.secure_url },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Avatar uploaded successfully",
                imageUrl: uploadResult.secure_url,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("AVATAR UPLOAD ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Remove from Cloudinary (ignore errors if not found)
        try {
            await cloudinary.uploader.destroy(`golan-avatars/user_${currentUser._id}`);
        } catch {
            // Ignore — image might not exist in Cloudinary
        }

        // Remove from DB
        await connectDB();
        await User.findByIdAndUpdate(currentUser._id, {
            $unset: { image: 1 },
        });

        return NextResponse.json(
            { success: true, message: "Avatar removed" },
            { status: 200 }
        );
    } catch (error) {
        console.error("AVATAR DELETE ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
