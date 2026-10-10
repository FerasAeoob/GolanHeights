import { z } from "zod";

export interface PlaceOrderItem {
    id: string;
    title: { en: string; ar?: string; he?: string };
    hidden: boolean;
}

// Missing/null values sort before numbers in MongoDB, so new and legacy places
// keep newest-first order above the manually ordered records.
export function getPlacesPageSort(sort?: string): Record<string, 1 | -1> {
    return sort === "top-rated"
        ? { averageRating: -1, reviewsCount: -1 }
        : { publicOrder: 1, createdAt: -1, _id: -1 };
}

export const placeOrderInputSchema = z.object({
    ids: z.array(z.string().regex(/^[a-f0-9]{24}$/)).max(20000)
        .refine((ids) => new Set(ids).size === ids.length),
    revision: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export function movePlaceOrder(ids: string[], from: number, to: number): string[] {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return ids;
    const next = [...ids];
    const [id] = next.splice(from, 1);
    next.splice(to, 0, id);
    return next;
}
