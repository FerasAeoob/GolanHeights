import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Review from "@/database/review/review.model";
import Place from "@/database/place.model";
import { updatePlaceRating } from "@/lib/reviews";

import { requireVerifiedUser, EmailNotVerifiedError, requireAuth } from "@/lib/permissions";
import { deleteReviewSchema } from "@/database/review/review.schema";

type RouteContext = {
    params: Promise<{
        reviewId: string;
    }>;
};

export async function DELETE(
    _req: NextRequest,
    { params }: RouteContext
) {
    try {
        const currentUser = await requireAuth();
        const { reviewId } = await params;

        const validated = deleteReviewSchema.parse({ reviewId });

        if (!mongoose.Types.ObjectId.isValid(validated.reviewId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid reviewId is required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        const review = await Review.findById(validated.reviewId);

        if (!review) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Review not found",
                },
                { status: 404 }
            );
        }

        const currentUserId = currentUser?._id
            ? String(currentUser._id)
            : (currentUser as { id?: unknown })?.id
                ? String((currentUser as { id?: unknown }).id)
                : null;

        const isOwner = !!currentUserId && review.userId.toString() === currentUserId;
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

        await review.deleteOne();
        await updatePlaceRating(review.placeId.toString());

        return NextResponse.json(
            {
                success: true,
                message: "Review deleted successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error?.name === "ZodError") {
            const firstIssue = error.issues[0];
            return NextResponse.json(
                { success: false, errorCode: firstIssue.message, field: firstIssue.path[0] },
                { status: 400 }
            );
        }

        if (error?.message === "Unauthorized") {
            return NextResponse.json({ success: false, errorCode: "UNAUTHORIZED" }, { status: 401 });
        }

        console.error("DELETE REVIEW ERROR:", error);

        return NextResponse.json(
            { success: false, errorCode: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}

// POST /api/reviews/:reviewId  — owner or admin reply
export async function POST(
    req: NextRequest,
    { params }: RouteContext
) {
    try {
        const currentUser = await requireVerifiedUser();
        const currentUserId = currentUser?._id
            ? String(currentUser._id)
            : (currentUser as { id?: unknown })?.id
                ? String((currentUser as { id?: unknown }).id)
                : null;
        const { reviewId } = await params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ success: false, message: "Valid reviewId is required" }, { status: 400 });
        }

        const body = await req.json();
        const text = (body?.text ?? "").trim();
        if (!text || text.length > 2000) {
            return NextResponse.json({ success: false, errorCode: "REPLY_TEXT_INVALID" }, { status: 400 });
        }

        await connectDB();

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
        }

        // Permission: admin OR place owner
        const isAdmin = currentUser.role === "admin";
        if (!isAdmin) {
            const place = await Place.findById(review.placeId).select("ownerId").lean<{ ownerId?: any }>();
            const ownerId = place?.ownerId ? String(place.ownerId) : null;
            const isPlaceOwner = !!ownerId && !!currentUserId && ownerId === currentUserId;
            if (!isPlaceOwner) {
                return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
            }
        }

        // If a reply already exists, only the original author can edit it.
        // This prevents admins from overwriting owner replies and vice versa.
        if (review.reply?.userId) {
            const originalAuthorId = review.reply.userId.toString();
            if (originalAuthorId !== currentUserId) {
                return NextResponse.json(
                    { success: false, errorCode: "REPLY_OWNED_BY_OTHER" },
                    { status: 403 }
                );
            }
        }

        // Write reply (create or update by the same author)
        review.set("reply", {
            text,
            userId: currentUserId ? new mongoose.Types.ObjectId(currentUserId) : null,
            createdAt: new Date(),
        });
        await review.save();

        const place = await Place.findById(review.placeId).select("ownerId").lean();
        const ownerIdStr = place?.ownerId ? place.ownerId.toString() : null;
        const replyObj = {
            text: review.reply!.text,
            userId: review.reply!.userId.toString(),
            createdAt: review.reply!.createdAt,
            isOwnerReply:
                !!ownerIdStr &&
                !!review.reply?.userId &&
                review.reply.userId.toString() === ownerIdStr,
        };

        return NextResponse.json(
            { success: true, reply: replyObj },
            { status: 200 }
        );
    } catch (error: any) {
        if (error?.message === "Unauthorized") {
            return NextResponse.json({ success: false, errorCode: "UNAUTHORIZED" }, { status: 401 });
        }
        if (error instanceof EmailNotVerifiedError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "EMAIL_NOT_VERIFIED",
                    message: "Please verify your email before continuing."
                },
                { status: 403 }
            );
        }
        console.error("REPLY REVIEW ERROR:", error);
        return NextResponse.json({ success: false, errorCode: "UNKNOWN_ERROR" }, { status: 500 });
    }
}

// PATCH /api/reviews/:reviewId  — delete the reply (original author only)
export async function PATCH(
    _req: NextRequest,
    { params }: RouteContext
) {
    try {
        const currentUser = await requireVerifiedUser();
        const currentUserId = currentUser?._id
            ? String(currentUser._id)
            : (currentUser as { id?: unknown })?.id
                ? String((currentUser as { id?: unknown }).id)
                : null;
        const { reviewId } = await params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ success: false, message: "Valid reviewId is required" }, { status: 400 });
        }

        await connectDB();

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
        }

        if (!review.reply?.userId) {
            return NextResponse.json({ success: false, message: "No reply to delete" }, { status: 404 });
        }

        // Only the original reply author can delete it
        if (review.reply.userId.toString() !== currentUserId) {
            return NextResponse.json({ success: false, errorCode: "REPLY_OWNED_BY_OTHER" }, { status: 403 });
        }

        review.set("reply", null);
        await review.save();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        if (error?.message === "Unauthorized") {
            return NextResponse.json({ success: false, errorCode: "UNAUTHORIZED" }, { status: 401 });
        }
        if (error instanceof EmailNotVerifiedError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "EMAIL_NOT_VERIFIED",
                    message: "Please verify your email before continuing."
                },
                { status: 403 }
            );
        }
        console.error("DELETE REPLY ERROR:", error);
        return NextResponse.json({ success: false, errorCode: "UNKNOWN_ERROR" }, { status: 500 });
    }
}