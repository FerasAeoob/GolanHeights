import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Comment from "@/database/comment.model";
import { requireAuth } from "@/lib/permissions";
import {
    updateCommentSchema,
    deleteCommentSchema,
} from "@/database/comment.schema";

type RouteContext = {
    params: Promise<{
        commentId: string;
    }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    try {
        const currentUser = await requireAuth();
        const { commentId } = await params;

        const validatedCommentId = deleteCommentSchema.parse({ commentId });

        if (!mongoose.Types.ObjectId.isValid(validatedCommentId.commentId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid commentId is required",
                },
                { status: 400 }
            );
        }

        const body = await req.json();
        const validatedData = updateCommentSchema.parse(body);

        await connectDB();

        const comment = await Comment.findById(validatedCommentId.commentId);

        if (!comment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Comment not found",
                },
                { status: 404 }
            );
        }

        const isOwner = comment.userId.toString() === currentUser._id;
        const isAdmin = currentUser.role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden",
                },
                { status: 403 }
            );
        }

        comment.text = validatedData.text;
        await comment.save();

        const updatedComment = await Comment.findById(comment._id)
            .select("user text createdAt updatedAt")
            .populate("user", "_id name image");

        return NextResponse.json(
            {
                success: true,
                message: "Comment updated successfully",
                comment: updatedComment,
            },
            { status: 200 }
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

        console.error("UPDATE COMMENT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
    try {
        const currentUser = await requireAuth();
        const { commentId } = await params;

        const validatedCommentId = deleteCommentSchema.parse({ commentId });

        if (!mongoose.Types.ObjectId.isValid(validatedCommentId.commentId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid commentId is required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const comment = await Comment.findById(validatedCommentId.commentId);

        if (!comment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Comment not found",
                },
                { status: 404 }
            );
        }

        const isOwner = comment.userId.toString() === currentUser._id;
        const isAdmin = currentUser.role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden",
                },
                { status: 403 }
            );
        }

        await Comment.findByIdAndDelete(validatedCommentId.commentId);

        return NextResponse.json(
            {
                success: true,
                message: "Comment deleted successfully",
            },
            { status: 200 }
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

        console.error("DELETE COMMENT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}