import { z } from "zod";

const phoneSchema = z
    .string()
    .trim()
    .min(10, "INVALID_PHONE")
    .max(15, "INVALID_PHONE")
    .regex(/^\+?[0-9]+$/, "INVALID_PHONE");

/**
 * Reusable strong password schema.
 * Rules: 8–72 chars, uppercase, lowercase, digit, special character.
 */
const passwordSchema = z
    .string()
    .min(8, "PASSWORD_TOO_SHORT")
    .max(72, "PASSWORD_TOO_LONG")
    .regex(/[A-Z]/, "PASSWORD_MISSING_UPPERCASE")
    .regex(/[a-z]/, "PASSWORD_MISSING_LOWERCASE")
    .regex(/[0-9]/, "PASSWORD_MISSING_NUMBER")
    .regex(/[^A-Za-z0-9]/, "PASSWORD_MISSING_SPECIAL");

export const registerSchema = z.object({
    name: z.string().trim().min(2, "NAME_TOO_SHORT").max(50, "NAME_TOO_LONG"),
    email: z.string().trim().email("INVALID_EMAIL"),
    phone: phoneSchema.optional(),
    image: z.string().trim().url("IMAGE_URL_INVALID").optional(),
    password: passwordSchema,
    acceptTerms: z.literal(true, {
        message: "TERMS_NOT_ACCEPTED",
    }),
});

export const loginSchema = z.object({
    email: z.string().trim().email("INVALID_EMAIL"),
    password: z.string().min(1, "PASSWORD_REQUIRED"),
    rememberMe: z.boolean().optional(),
});

export const updateUserSchema = z.object({
    name: z.string().trim().min(2, "NAME_TOO_SHORT").max(50, "NAME_TOO_LONG").optional(),
    phone: phoneSchema.optional(),
    image: z.string().trim().url("IMAGE_URL_INVALID").optional(),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "CURRENT_PASSWORD_REQUIRED"),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, "CONFIRM_PASSWORD_REQUIRED"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "PASSWORDS_DO_NOT_MATCH",
    });


export const createBusinessSchema = z.object({
    businessName: z.string().trim().min(2, "BUSINESS_NAME_TOO_SHORT").max(50, "BUSINESS_NAME_TOO_LONG"),
    website: z.string().trim().url("WEBSITE_URL_INVALID").optional(),
    instagram: z.string().trim().url("INSTAGRAM_URL_INVALID").optional(),
});

export const updateBusinessSchema = z.object({
    businessName: z.string().trim().min(2, "BUSINESS_NAME_TOO_SHORT").max(50, "BUSINESS_NAME_TOO_LONG").optional(),
    website: z.string().trim().url("WEBSITE_URL_INVALID").optional(),
    instagram: z.string().trim().url("INSTAGRAM_URL_INVALID").optional(),
});