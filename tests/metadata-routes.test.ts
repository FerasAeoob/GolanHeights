import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

type AppPathRoutesManifest = Record<string, string>;

test("build exposes robots and sitemap at the public root", async () => {
    const manifest = JSON.parse(
        await readFile(".next/app-path-routes-manifest.json", "utf8"),
    ) as AppPathRoutesManifest;

    assert.equal(manifest["/robots.txt/route"], "/robots.txt");
    assert.equal(manifest["/sitemap.xml/route"], "/sitemap.xml");
    assert.equal(manifest["/[lang]/robots.txt/route"], undefined);
    assert.equal(manifest["/[lang]/sitemap.xml/route"], undefined);
});
