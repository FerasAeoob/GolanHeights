import { z } from "zod";

export const createCommentSchema = z.object({
    placeId: z
        .string()
        .min(1, "placeId is required"),

    text: z
        .string()
        .min(1, "Comment cannot be empty")
        .max(255, "Comment too long"),
});

export const updateCommentSchema = z.object({
    text: z
        .string()
        .min(1, "Comment cannot be empty")
        .max(255, "Comment too long"),
});

export const deleteCommentSchema = z.object({
    commentId: z
        .string()
        .min(1, "commentId is required"),
});