import { z } from "zod";
import { CATEGORY_SLUGS } from "@/lib/categories";

/**
 * Shared schema for dynamic route params
 * Validates the slug in GET/PUT requests
 */
const OpeningHoursZodSchema = z.object({
    day: z.number().min(0).max(6),
    open: z.number().min(0).max(2359), // e.g., 1000 for 10:00
    close: z.number().min(0).max(2359), // e.g., 2000 for 20:00
    isClosed: z.boolean().default(false),
});

export const SlugSchema = z.object({
    slug: z
        .string()
        .min(1, "Slug cannot be empty")
        .max(100, "Slug too long")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase ASCII letters, numbers, and hyphens (no consecutive or trailing hyphens)")
});

/**
 * Strict validation for manual SEO slugs
 */
const ManualSlugValidator = z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid format: lowercase letters, numbers, and hyphens only. No spaces.");

export const CategorySchema = z.object({
    category: z
        .enum(CATEGORY_SLUGS)
        .optional(),
});


/**
 * Schema for updating a Place
 * Used in PUT route, validates partial updates
 */
export const UpdatePlaceSchema = z.object({
    title: z
        .object({
            en: z.string().min(3, "English title too short").optional(),
            he: z.string().optional(),
            ar: z.string().optional()
        })
        .optional(),

    slug: z.object({
        he: ManualSlugValidator.optional(),
        ar: ManualSlugValidator.optional(),
    }).optional(),

    description: z
        .object({
            en: z.string().min(10, "English description too short").optional(),
            he: z.string().optional(),
            ar: z.string().optional()
        })
        .optional(),

    shortDescription: z
        .object({
            en: z.string().max(255, "English short description too long").optional(),
            he: z.string().max(255).optional(),
            ar: z.string().max(255).optional()
        })
        .optional(),

    category: z
        .enum(CATEGORY_SLUGS)
        .optional(),

    images: z
        .array(
            z.object({
                url: z.string().min(1, "Image URL cannot be empty"),
                alt: z.object({
                    en: z.string().optional().default("Place image"),
                    he: z.string().optional(),
                    ar: z.string().optional(),
                }),
            })
        ).optional().default([]),

    location: z
        .object({
            lat: z.number(),
            lng: z.number(),
            name: z.object({
                en: z.string(),
                he: z.string(),
                ar: z.string()
            })
        })
        .optional(),

    contact: z
        .object({
            phone: z.string().optional(),
            website: z.string().optional(),
            instagram: z.string().optional()
        })
        .optional(),
    openHours: z.array(OpeningHoursZodSchema).optional(),
    open: z.string().optional(),
    rating: z.string().optional(),
    duration: z.string().optional(),
    price: z.string().optional(),
    mapLink: z.string().optional(),

    featured: z.boolean().optional().default(false),
});
export const createplaceschema = z.object({
    title: z
        .object({
            en: z.string().min(3, "English title too short"),
            he: z.string(),
            ar: z.string()
        }),

    slug: z.object({
        he: ManualSlugValidator,
        ar: ManualSlugValidator,
    }),

    description: z
        .object({
            en: z.string().min(10, "English description too short"),
            he: z.string(),
            ar: z.string()
        })
    ,

    shortDescription: z
        .object({
            en: z.string().max(255, "English short description too long"),
            he: z.string().max(255),
            ar: z.string().max(255)
        })
        .optional(),

    category: z
        .enum(CATEGORY_SLUGS)
    ,

    images: z.array(
        z.object({
            url: z.string().min(1, "Image URL cannot be empty"),
            alt: z.object({
                en: z.string().optional().default("Place image"),
                he: z.string().optional(),
                ar: z.string().optional(),
            }),
        })
    ).optional().default([]),

    location: z
        .object({
            lat: z.number(),
            lng: z.number(),
            name: z.object({
                en: z.string(),
                he: z.string(),
                ar: z.string()
            })
        })
    ,

    contact: z
        .object({
            phone: z.string().optional(),
            website: z.string().optional(),
            instagram: z.string().optional()
        })
        .optional(),
    openHours: z.array(OpeningHoursZodSchema).optional(),
    open: z.string().optional(),
    rating: z.string().optional(),
    duration: z.string().optional(),
    price: z.string().optional(),
    mapLink: z.string().optional(),

    featured: z.boolean().optional().default(false)
});

/**
 * Optional: derive TypeScript types from Zod
 * You can use these in your code to type request bodies or params
 */
export type UpdatePlace = z.infer<typeof UpdatePlaceSchema>;
export type SlugParams = z.infer<typeof SlugSchema>;