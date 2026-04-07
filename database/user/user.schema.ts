import { z } from "zod";

const phoneSchema = z
    .string()
    .trim()
    .min(10)
    .max(15)
    .regex(/^\+?[0-9]+$/, "Invalid phone number");

export const registerSchema = z.object({
    name: z.string().trim().min(2).max(50),
    email: z.string().trim().email(),
    phone: phoneSchema.optional(),
    image: z.string().trim().url().optional(),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(6),
});

export const updateUserSchema = z.object({
    name: z.string().trim().min(2).max(50).optional(),
    phone: phoneSchema.optional(),
    image: z.string().trim().url().optional(),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
        confirmPassword: z.string().min(6),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });


export const createBusinessSchema = z.object({
    businessName: z.string().trim().min(2).max(50),
    website: z.string().trim().url().optional(),
    instagram: z.string().trim().url().optional(),
});

export const updateBusinessSchema = z.object({
    businessName: z.string().trim().min(2).max(50).optional(),
    website: z.string().trim().url().optional(),
    instagram: z.string().trim().url().optional(),
});