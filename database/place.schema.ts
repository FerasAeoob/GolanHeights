import { z } from "zod";

/**
 * Shared schema for dynamic route params
 * Validates the slug in GET/PUT requests
 */
export const SlugSchema = z.object({
    slug: z
        .string()
        .min(1, "Slug cannot be empty")
        .max(100, "Slug too long")
        // 1. Add A-Z to the regex so it doesn't reject capital letters
        .regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters, numbers, and hyphens")
        // 2. Automatically transform the output to lowercase
        .toLowerCase()
});

export const CategorySchema = z.object({
    category: z
        .enum(["nature", "restaurant", "activity", "hotel", "viewpoint"])
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
        .enum(["nature", "restaurant", "activity", "hotel", "viewpoint"])
        .optional(),

    images: z
        .array(
            z.object({
                url: z.string().min(1, "Image URL cannot be empty"),
                alt: z.object({
                    en: z.string().min(1).optional(),
                    he: z.string().optional(),
                    ar: z.string().optional(),
                }).optional(),
            })
        )
        .optional(),

    location: z
        .object({
            lat: z.number(),
            lng: z.number(),
            name: z.string()
        })
        .optional(),

    contact: z
        .object({
            phone: z.string().optional(),
            website: z.string().optional(),
            instagram: z.string().optional()
        })
        .optional(),
    openHours: z.string().optional(),
    rating: z.string().optional(),
    duration: z.string().optional(),
    price: z.string().optional(),

    featured: z.boolean().optional(),
    mapLink: z.string().optional(),
});
export const createplaceschema = z.object({
    title: z
        .object({
            en: z.string().min(3, "English title too short"),
            he: z.string(),
            ar: z.string()
        })
    ,

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
        .enum(["nature", "restaurant", "activity", "hotel", "viewpoint"])
    ,

    images: z.array(
        z.object({
            url: z.string().min(1, "Image URL cannot be empty"),
            alt: z.object({
                en: z.string().min(1, "English alt text is required"),
                he: z.string().optional(),
                ar: z.string().optional(),
            }),
        })
    ).min(1, "At least one image is required"),

    location: z
        .object({
            lat: z.number(),
            lng: z.number(),
            name: z.string()
        })
    ,

    contact: z
        .object({
            phone: z.string().optional(),
            website: z.string().optional(),
            instagram: z.string().optional()
        })
        .optional(),
    openHours: z.string(),
    rating: z.number().min(0).max(5),
    duration: z.string(),
    price: z.string(),
    mapLink: z.string().url("Invalid map link"),

    featured: z.boolean()
});

/**
 * Optional: derive TypeScript types from Zod
 * You can use these in your code to type request bodies or params
 */
export type UpdatePlace = z.infer<typeof UpdatePlaceSchema>;
export type SlugParams = z.infer<typeof SlugSchema>;