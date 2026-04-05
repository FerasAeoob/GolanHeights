import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { updatePlaceRating } from "@/lib/reviews";
import connectDB from "@/lib/mongodb";
import Review from "@/database/review/review.model";
import Place from "@/database/place.model";

import { requireAuth } from "@/lib/permissions";
import { createOrUpdateReviewSchema } from "@/database/review/review.schema";

// GET reviews for a place
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");

    if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
      return NextResponse.json(
        { success: false, message: "Valid placeId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const reviews = await Review.find({ placeId })
      .populate("userId", "_id name image")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, reviews },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// CREATE OR UPDATE review
export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAuth();

    const body = await req.json();
    const validatedData = createOrUpdateReviewSchema.parse(body);

    if (!mongoose.Types.ObjectId.isValid(validatedData.placeId)) {
      return NextResponse.json(
        { success: false, message: "Valid placeId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // check place exists
    const place = await Place.findById(validatedData.placeId);
    if (!place) {
      return NextResponse.json(
        { success: false, message: "Place not found" },
        { status: 404 }
      );
    }

    // check if review already exists
    const existingReview = await Review.findOne({
      userId: currentUser._id,
      placeId: validatedData.placeId,
    });

    let review;

    if (existingReview) {
      // UPDATE
      existingReview.rating = validatedData.rating;
      existingReview.text = validatedData.text;

      await existingReview.save();

      review = existingReview;
    } else {
      // CREATE
      review = await Review.create({
        userId: currentUser._id,
        placeId: validatedData.placeId,
        rating: validatedData.rating,
        text: validatedData.text,
      });
    }
    await updatePlaceRating(validatedData.placeId);

    // return populated review
    const populatedReview = await Review.findById(review._id)
      .populate("userId", "_id name image");

    return NextResponse.json(
      {
        success: true,
        message: existingReview
          ? "Review updated successfully"
          : "Review created successfully",
        review: populatedReview,
      },
      { status: existingReview ? 200 : 201 }
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("CREATE/UPDATE REVIEW ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}