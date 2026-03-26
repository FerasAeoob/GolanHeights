/**
 * Multilingual-safe slugify
 * Supports Arabic, Hebrew, English, and all Unicode letters
 */
export function slugifyMultilingual(text: string): string {
    if (!text) return "";

    return text
        .toLowerCase()
        .trim()
        .normalize("NFKD") // normalize accents
        .replace(/[^\p{L}\p{N}\s-]/gu, "") // keep letters/numbers from ALL languages
        .replace(/[\s_]+/g, "-") // spaces/underscores → dash
        .replace(/-+/g, "-") // collapse multiple dashes
        .replace(/^-+|-+$/g, ""); // trim dashes
}

/**
 * Generate multilingual slugs with fallback
 */
export function generateSlugs(title: {
    en?: string;
    ar?: string;
    he?: string;
}) {
    const base = slugifyMultilingual(title.en || "");

    return {
        en: slugifyMultilingual(title.en || ""),
        ar: title.ar ? slugifyMultilingual(title.ar) : base,
        he: title.he ? slugifyMultilingual(title.he) : base,
    };
}

/**
 * Optional helper: get slug by locale safely
 */
export function getSlugByLocale(
    slug: { en?: string; ar?: string; he?: string },
    locale: "en" | "ar" | "he"
): string {
    return slug?.[locale] || slug?.en || "";
}

/**
 * Optional helper: ensure slug object shape (safety)
 */
export function normalizeSlugObject(slug: any) {
    return {
        en: slug?.en || "",
        ar: slug?.ar || slug?.en || "",
        he: slug?.he || slug?.en || "",
    };
}

/**
 * Optional: check if slug changed (useful in updates)
 */
export function shouldUpdateSlug(oldTitle: any, newTitle: any): boolean {
    return (
        oldTitle?.en !== newTitle?.en ||
        oldTitle?.ar !== newTitle?.ar ||
        oldTitle?.he !== newTitle?.he
    );
}