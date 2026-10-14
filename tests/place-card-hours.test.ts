import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type PlaceCard from "../components/places/placecard";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// Keep the card, bookmark and hours components real; isolate Next's router/image boundary.
function load(relativePath: string): Record<string, unknown> {
    const filename = path.join(root, relativePath);
    const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const moduleObject = { exports: {} };
    vm.runInNewContext(compiled, {
        module: moduleObject, exports: moduleObject.exports,
        require: (id: string) => {
            if (id === "next/navigation") return { useRouter: () => ({ refresh() {} }) };
            if (id === "next/link") return function TestLink({ children, ...props }: React.ComponentProps<"a">) { return React.createElement("a", props, children); };
            if (id === "next/image") return function TestImage() { return null; };
            if (id.startsWith("@/") || id.startsWith(".")) {
                const base = id.startsWith("@/") ? id.slice(2) : path.relative(root, path.resolve(path.dirname(filename), id));
                for (const extension of [".ts", ".tsx"]) {
                    try { return load(base + extension); } catch (error) {
                        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
                    }
                }
            }
            return require(id);
        },
    });
    return moduleObject.exports;
}

const Card = load("components/places/placecard.tsx").default as typeof PlaceCard;
type Place = React.ComponentProps<typeof Card>["place"];
const allDay = Array.from({ length: 7 }, (_, day) => ({ day, open: 0, close: 0, isClosed: false, is24Hours: true }));
const closed = allDay.map(day => ({ ...day, isClosed: true }));
const cases = [
    { name: "no hours or ratings", hours: [], reviews: 0, status: null },
    { name: "no hours with ratings", hours: [], reviews: 3, status: null },
    { name: "omitted hours with ratings", hours: undefined, reviews: 3, status: null },
    { name: "invalid hours with ratings", hours: [{ day: 0, open: 2500, close: 2600, isClosed: false }], reviews: 3, status: null },
    { name: "non-finite hours with ratings", hours: [{ day: 0, open: NaN, close: NaN, isClosed: false }], reviews: 3, status: null },
    { name: "24-hour schedule", hours: allDay, reviews: 3, status: "openNow" },
    { name: "explicitly closed schedule", hours: closed, reviews: 0, status: "closed" },
] as const;

for (const locale of ["en", "ar", "he"] as const) {
    const dict = JSON.parse(readFileSync(path.join(root, `dictionaries/${locale}.json`), "utf8"));
    for (const appearance of ["default", "places"] as const) {
        for (const scenario of cases) {
            test(`${locale}/${appearance}: stay with ${scenario.name}`, () => {
                const place = {
                    _id: "place-id", title: { en: "Cabin" }, slug: { en: "cabin" },
                    shortDescription: { en: "A stay" }, category: "stays", images: [],
                    location: { name: { en: "Golan" } }, openHours: scenario.hours,
                    open: "Legacy opening text", averageRating: 4.5, reviewsCount: scenario.reviews,
                } as unknown as Place;
                const markup = renderToStaticMarkup(React.createElement(Card, { place, locale, dict, appearance }));
                assert.ok(markup.includes(`aria-label="${dict.favorites.add}"`), "bookmark remains visible");
                assert.equal(/>4\.5<\/span>/.test(markup), scenario.reviews > 0, "ratings depend on reviews only");
                for (const key of ["openNow", "closed", "closingSoon"] as const) {
                    assert.equal(markup.includes(dict.openingHours[key]), scenario.status === key, `${key} badge`);
                }
                assert.ok(markup.includes(`dir="${locale === "en" ? "ltr" : "rtl"}"`));
                assert.ok(markup.includes(locale === "en" ? 'href="/places/cabin"' : `href="/${locale}/places/cabin"`));
            });
        }
    }
}
