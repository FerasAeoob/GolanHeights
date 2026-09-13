import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createRequire } from "node:module";

const { default: nextConfig } = createRequire(import.meta.url)("../next.config.ts") as typeof import("../next.config");

type AppPathRoutesManifest = Record<string, string>;

test("build exposes crawler metadata at the root and redirects localized sitemap aliases", async () => {
    const manifest = JSON.parse(
        await readFile(".next/app-path-routes-manifest.json", "utf8"),
    ) as AppPathRoutesManifest;

    assert.equal(manifest["/robots.txt/route"], "/robots.txt");
    assert.equal(manifest["/sitemap.xml/route"], "/sitemap.xml");
    assert.equal(manifest["/[lang]/robots.txt/route"], undefined);
    const { redirects } = JSON.parse(await readFile(".next/routes-manifest.json", "utf8")) as {
        redirects: Array<{ regex: string; destination: string; statusCode: number; has?: unknown[] }>;
    };
    for (const lang of ["en", "ar", "he", "unsupported"]) {
        const redirect = redirects.find((entry) => !entry.has?.length && new RegExp(entry.regex).test(`/${lang}/sitemap.xml`));
        assert.equal(redirect?.destination, "/sitemap.xml");
        assert.equal(redirect?.statusCode, 308);
    }
    assert.ok(!redirects.some((entry) => !entry.has?.length && new RegExp(entry.regex).test("/sitemap.xml")), "root sitemap must not redirect");
});

test("configuration makes localized sitemap generators aliases of the canonical root", async () => {
    const redirects = await nextConfig.redirects!();
    const alias = redirects.find((entry) => entry.source === "/:lang/sitemap.xml");
    assert.equal(alias?.destination, "/sitemap.xml");
    assert.equal(alias?.permanent, true);
});
