import { z } from "zod";

export const createOrUpdateReviewSchema = z.object({
    placeId: z.string().min(1, "placeId is required"),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
    text: z
        .string()
        .trim()
        .min(1, "Review cannot be empty")
        .max(1000, "Review is too long"),
});

export const deleteReviewSchema = z.object({
    reviewId: z.string().min(1, "reviewId is required"),
});