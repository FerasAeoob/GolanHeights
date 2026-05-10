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
                { success: false, errorCode: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("avatar") as File | null;

        if (!file || file.size === 0) {
            return NextResponse.json(
                { success: false, errorCode: "IMAGE_REQUIRED" },
                { status: 400 }
            );
        }

        // Enforce 5MB server-side limit
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { success: false, errorCode: "IMAGE_TOO_LARGE" },
                { status: 400 }
            );
        }

        // Read bytes once for both validation and upload
        const bytes = await file.arrayBuffer();
        const header = new Uint8Array(bytes).slice(0, 12);

        // Magic-byte validation
        const isJpeg = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
        const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
        const isWebp = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46
            && header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;

        if (!isJpeg && !isPng && !isWebp) {
            return NextResponse.json(
                { success: false, errorCode: "INVALID_IMAGE_FORMAT" },
                { status: 400 }
            );
        }

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
            { success: false, errorCode: "UPLOAD_FAILED" },
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
