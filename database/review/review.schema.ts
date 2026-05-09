import { z } from "zod";

export const createOrUpdateReviewSchema = z.object({
    placeId: z.string().min(1, "PLACE_ID_REQUIRED"),
    rating: z.number().min(1, "RATING_TOO_LOW").max(5, "RATING_TOO_HIGH"),
    text: z
        .string()
        .trim()
        .min(1, "REVIEW_EMPTY")
        .max(1000, "REVIEW_TOO_LONG"),
});

export const deleteReviewSchema = z.object({
    reviewId: z.string().min(1, "REVIEW_ID_REQUIRED"),
});