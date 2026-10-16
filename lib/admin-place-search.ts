export const ADMIN_PLACE_SEARCH_MAX_LENGTH = 120;

export type AdminPlaceSearchParams = Record<string, string | string[] | undefined>;

export function parseAdminPlaceSearch(params: { search?: unknown; page?: unknown }) {
    const invalid = params.search !== undefined && (
        typeof params.search !== "string" || params.search.length > ADMIN_PLACE_SEARCH_MAX_LENGTH || params.search.includes("\0")
    );
    const query = !invalid && typeof params.search === "string" ? params.search.trim() : "";
    const page = typeof params.page === "string" && /^[1-9]\d{0,5}$/.test(params.page)
        ? Number(params.page)
        : 1;
    return { query, page, invalid };
}

export function buildAdminPlaceSearchParams(current: string, query: string) {
    const params = new URLSearchParams(current);
    const normalized = query.trim();
    if (normalized) params.set("search", normalized);
    else params.delete("search");
    params.delete("page");
    return params;
}
