import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import type { Metadata, MetadataRoute } from "next";
import type { Locale } from "../lib/get-dictionary";

const require = createRequire(import.meta.url);
const { locales } = require("../lib/get-dictionary.ts") as typeof import("../lib/get-dictionary");
const baseUrl = "https://www.golanwiki.com";
const staticPaths = ["/", "/places", "/about", "/history", "/contact", "/cherry-picking",
    "/privacy-policy", "/terms-of-use", "/cookie-policy"];
const updatedAt = new Date("2026-08-21T10:00:00Z");
type SitemapPlace = { slug: { en: string; ar?: string; he?: string }; updatedAt: Date };
const visiblePlaces: SitemapPlace[] = [
    { slug: { en: "nature-place", ar: "nature-place-ar", he: "nature-place-he" }, updatedAt },
    { slug: { en: "english-fallback" }, updatedAt },
    { slug: { en: "nature-place", ar: "nature-place-ar", he: "nature-place-he" }, updatedAt },
    { slug: { en: "invalid-localizations", ar: "مكان", he: "מקום" }, updatedAt },
    { slug: { en: "Invalid Slug" }, updatedAt },
];
let failDatabase = false;
let currentPlace = visiblePlaces[0];
const detailRecord = () => ({ ...currentPlace, title: { en: "Place" }, shortDescription: { en: "Description" } });

// Execute the production exports, isolating unavailable DB access and unrelated UI imports.
type ModuleLoader = { _load: (request: string, parent: unknown, isMain: boolean) => unknown };
const moduleLoader = require("node:module") as ModuleLoader;
const originalLoad = moduleLoader._load;
moduleLoader._load = function (request, parent, isMain) {
    if (request.endsWith(".css") || request.startsWith("@/components/")) return {};
    if (request === "@/lib/auth") return { getCurrentUser: async () => null };
    if (request === "@/lib/db/settings") return { getSettings: async () => ({}) };
    if (request === "@/lib/db/places") return {
        getRequestMemoizedFullPlace: async () => detailRecord(), toPublicPlaceDTO: (place: unknown) => place,
    };
    if (request === "@/lib/mongodb") return async () => {
        if (failDatabase) throw new Error("Database unavailable");
    };
    if (request === "@/database/place.model") return {
        find: (filter: unknown) => {
            assert.deepEqual(filter, { hidden: { $ne: true } });
            return { select: (fields: string) => {
                assert.equal(fields, "slug updatedAt");
                return { lean: async () => visiblePlaces };
            } };
        },
    };
    return originalLoad.call(this, request, parent, isMain);
};
type PageMetadata = { generateMetadata: (input: { params: Promise<{ lang: Locale; slug: string }> }) => Promise<Metadata> };
const pages = new Map<string, PageMetadata>();
let sitemap: () => Promise<MetadataRoute.Sitemap>;
try {
    for (const path of staticPaths) {
        pages.set(path, require(`../app/[lang]/(main)${path === "/" ? "" : path}/page.tsx`) as PageMetadata);
    }
    pages.set("detail", require("../app/[lang]/(main)/places/[slug]/page.tsx") as PageMetadata);
    sitemap = (require("../app/sitemap.ts") as { default: typeof sitemap }).default;
} finally {
    moduleLoader._load = originalLoad;
}

function absolutePath(path: string, locale: Locale) {
    return baseUrl + (locale === "en" ? path : path === "/" ? `/${locale}` : `/${locale}${path}`);
}

for (const path of staticPaths) {
    for (const lang of locales) {
        test(`${lang} ${path} metadata has a clean canonical and complete language alternatives`, async () => {
            const metadata = await pages.get(path)!.generateMetadata({ params: Promise.resolve({ lang, slug: "nature-place" }) });
            assert.equal(metadata.alternates?.canonical, absolutePath(path, lang));
            const languages = metadata.alternates?.languages;
            for (const locale of locales) assert.equal(languages?.[locale], absolutePath(path, locale));
            assert.equal(languages?.["x-default"], absolutePath(path, "en"));
        });
    }
}

test("sitemap contains all translated public static routes and unique visible place canonicals", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    assert.equal(urls.length, 34);
    assert.equal(new Set(urls).size, urls.length);
    for (const path of staticPaths) for (const locale of locales) {
        // The root sitemap URL may omit a trailing slash; both spellings resolve to the same root.
        assert.ok(urls.some((url) => new URL(url).href === new URL(absolutePath(path, locale)).href));
    }
    for (const place of visiblePlaces.slice(0, 2)) {
        currentPlace = place;
        for (const lang of locales) {
            const expected = absolutePath(`/places/${encodeURIComponent(place.slug[lang] || place.slug.en)}`, lang);
            const metadata = await pages.get("detail")!.generateMetadata({ params: Promise.resolve({ lang, slug: place.slug.en }) });
            assert.equal(metadata.alternates?.canonical, expected);
            assert.ok(urls.includes(expected));
            assert.equal(entries.find((entry) => entry.url === expected)?.lastModified, updatedAt);
            for (const locale of locales) {
                assert.equal(metadata.alternates?.languages?.[locale],
                    absolutePath(`/places/${encodeURIComponent(place.slug[locale] || place.slug.en)}`, locale));
            }
        }
    }
    for (const url of urls) {
        const parsed = new URL(url);
        assert.equal(parsed.search, "");
        assert.equal(parsed.hash, "");
        assert.ok(!/^\/en(?:\/|$)/.test(parsed.pathname));
        assert.ok(!/\/(login|signup|profile|favorites|area-51-sec|terms)(?:\/|$)/.test(parsed.pathname));
        assert.equal(url, encodeURI(decodeURI(url)));
    }
    assert.ok(urls.includes(`${baseUrl}/places/invalid-localizations`));
    assert.ok(!urls.some((url) => url.includes("/ar/places/invalid-localizations") || url.includes("/he/places/invalid-localizations")));
    assert.ok(!urls.some((url) => decodeURI(url).includes("مكان") || decodeURI(url).includes("מקום") || decodeURI(url).includes("Invalid Slug")));
});

test("sitemap preserves public static coverage when the DB fetch fails", async () => {
    failDatabase = true;
    const previousError = console.error;
    const failures: unknown[][] = [];
    console.error = (...args: unknown[]) => { failures.push(args); };
    try {
        const entries = await sitemap();
        assert.equal(entries.length, 27);
        assert.equal(failures.length, 1);
        assert.equal(failures[0][0], "Failed to fetch places for sitemap:");
    } finally {
        failDatabase = false;
        console.error = previousError;
    }
});

test("robots allows public crawling and points to the canonical sitemap while retaining private restrictions", () => {
    const robots = (require("../app/robots.ts") as { default: () => MetadataRoute.Robots }).default();
    assert.equal(robots.sitemap, `${baseUrl}/sitemap.xml`);
    assert.deepEqual(robots.rules, {
        userAgent: "*", allow: "/",
        disallow: ["/api/", "/admin/", "/area-51-sec/", "/login", "/signup", "/favorites",
            "/rewards", "/my-coupons", "/profile", "/dashboard"],
    });
});
