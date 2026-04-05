import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Review from "@/database/review/review.model";
import { updatePlaceRating } from "@/lib/reviews";

import { requireAuth } from "@/lib/permissions";
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

        const isOwner = review.userId.toString() === currentUser._id;
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

        console.error("DELETE REVIEW ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}