import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import type { getLocalizedPathname as GetLocalizedPathname } from "../utils/navigation";

const { getLocalizedPathname } = createRequire(import.meta.url)("../utils/navigation.ts") as {
    getLocalizedPathname: typeof GetLocalizedPathname;
};

test("localizes clean public paths and translates place slugs", () => {
    assert.equal(getLocalizedPathname("/en/about", "en", "", ""), "/about");
    assert.equal(getLocalizedPathname("/he", "en", "", ""), "/");
    assert.equal(getLocalizedPathname("/places", "ar", "", ""), "/ar/places");
    assert.equal(getLocalizedPathname("/ar/places/original", "he", "", "", {
        en: "original", he: "מקום", ar: "مكان",
    }), `/he/places/${encodeURIComponent("מקום")}`);
    assert.equal(getLocalizedPathname("/he/places/original", "ar", "", "", {
        en: "original",
    }), "/ar/places/original");
});

test("preserves explicitly supplied query and fragment while changing languages", () => {
    assert.equal(getLocalizedPathname("/he/places", "en", "search=cherry", "map"),
        "/places?search=cherry#map");
    assert.equal(getLocalizedPathname("/places", "ar", new URLSearchParams({ category: "nature" }), "#map"),
        "/ar/places?category=nature#map");
    assert.equal(getLocalizedPathname("/places", "en", { search: "cherry picking" }, ""),
        "/places?search=cherry+picking");
});

test("only undefined query and fragment inherit the current browser URL", () => {
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: { location: { search: "?filter=nature", hash: "#map" } },
    });
    try {
        assert.equal(getLocalizedPathname("/he/places", "en"), "/places?filter=nature#map");
        assert.equal(getLocalizedPathname("/he/places", "en", "", ""), "/places");
        assert.equal(getLocalizedPathname("/he/places", "en", new URLSearchParams(), ""), "/places");
        assert.equal(getLocalizedPathname("/he/places", "en", {}, ""), "/places");
    } finally {
        if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
        else Reflect.deleteProperty(globalThis, "window");
    }
});
