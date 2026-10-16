import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
const loader = require("node:module") as { _load: (id: string, parent: unknown, main: boolean) => unknown };
const originalLoad = loader._load;
let role: string | null = null;
let reads = 0;
let response = { places: [], total: 0, page: 1, pageCount: 1, query: "missing", invalid: false };
loader._load = function (id, parent, main) {
    if (id.startsWith("@/components/")) return () => null;
    if (id === "@/app/actions/places") return {};
    if (id === "@/lib/auth") return { getCurrentUser: async () => role ? { role } : null };
    if (id === "@/lib/permissions") return { isAdmin: (user: { role: string }) => user.role === "admin", isOwner: () => false };
    if (id === "next/navigation") return { redirect: (href: string) => { throw new Error(`redirect:${href}`); } };
    if (id === "@/lib/db/admin-places") return { getAdminPlaces: async () => { reads++; return response; } };
    if (id === "@/lib/db/places") return { getPlaces: async () => { reads++; return response.places; } };
    return originalLoad.call(this, id, parent, main);
};

test("unauthenticated and non-admin requests redirect before any admin place read", async () => {
    const { default: Page } = require("../app/[lang]/(main)/area-51-sec/page.tsx");
    loader._load = originalLoad;
    for (role of [null, "user", "business"]) {
        await assert.rejects(Page({ params: Promise.resolve({ lang: "en" }), searchParams: Promise.resolve({ search: "cafe" }) }), /redirect:/);
    }
    assert.equal(reads, 0);
});

test("empty matching results and pagination are localized and preserve query and filters", async () => {
    const { default: Page } = require("../app/[lang]/(main)/area-51-sec/page.tsx");
    role = "admin";
    for (const lang of ["en", "ar", "he"]) {
        const labels = require(`../dictionaries/${lang}.json`).adminPlaceSearch;
        response = { places: [], total: 0, page: 1, pageCount: 1, query: "missing", invalid: false };
        const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ lang }), searchParams: Promise.resolve({ search: "missing" }) }));
        assert.ok(html.includes(labels.noResults));
        assert.ok(!html.includes('aria-label="' + labels.pagination + '"'));
        response = { ...response, total: 101, page: 2, pageCount: 3, query: "cafe" };
        const paginated = renderToStaticMarkup(await Page({ params: Promise.resolve({ lang }), searchParams: Promise.resolve({ search: "cafe", page: "2", filter: ["one", "two"] }) }));
        const base = lang === "en" ? "/area-51-sec" : `/${lang}/area-51-sec`;
        assert.ok(paginated.includes(`${base}?search=cafe&amp;filter=one&amp;filter=two&amp;page=3`));
        assert.ok(paginated.includes(labels.page.replace("{page}", "2").replace("{pages}", "3")));
    }
});
