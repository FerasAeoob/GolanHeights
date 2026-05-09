import { z } from "zod";

export const createCommentSchema = z.object({
    placeId: z
        .string()
        .min(1, "PLACE_ID_REQUIRED"),

    text: z
        .string()
        .min(1, "COMMENT_EMPTY")
        .max(255, "COMMENT_TOO_LONG"),
});

export const updateCommentSchema = z.object({
    text: z
        .string()
        .min(1, "COMMENT_EMPTY")
        .max(255, "COMMENT_TOO_LONG"),
});

export const deleteCommentSchema = z.object({
    commentId: z
        .string()
        .min(1, "COMMENT_ID_REQUIRED"),
});