import { z } from "zod";

export const CONTACT_REASONS = ["general", "add", "update", "report", "partnership"] as const;
export type ContactReason = (typeof CONTACT_REASONS)[number];

export const contactSchema = z.object({
    name: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be 80 characters or fewer")),

    email: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().email("Please enter a valid email address").max(120, "Email must be 120 characters or fewer")),

    subject: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(3, "Subject must be at least 3 characters").max(150, "Subject must be 150 characters or fewer")),

    reason: z.enum(CONTACT_REASONS, {
        message: "Please select a valid reason",
    }),

    message: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be 2000 characters or fewer")),
});

export type ContactInput = z.infer<typeof contactSchema>;
