import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Comment from "@/database/comment.model";
import Place from "@/database/place.model";
import { requireAuth } from "@/lib/permissions";
import { createCommentSchema } from "@/database/comment.schema";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const placeId = searchParams.get("placeId");

        if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid placeId is required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const comments = await Comment.find({ placeId })
            .select("userId text createdAt")
            .populate("userId", "name image")
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                comments,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET COMMENTS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await requireAuth();

        const body = await req.json();
        const validatedData = createCommentSchema.parse(body);

        if (!mongoose.Types.ObjectId.isValid(validatedData.placeId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid placeId is required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const place = await Place.findById(validatedData.placeId);

        if (!place) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Place not found",
                },
                { status: 404 }
            );
        }

        const comment = await Comment.create({
            userId: currentUser._id,
            placeId: validatedData.placeId,
            text: validatedData.text,
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate("userId", "name image role");

        return NextResponse.json(
            {
                success: true,
                message: "Comment created successfully",
                comment: populatedComment,
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (error?.name === "ZodError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        if (error?.message === "Unauthorized") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        console.error("CREATE COMMENT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}