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
import type PlaceOrderEditor from "../components/admin/PlaceOrderEditor";
import type { installLegacyPlaceOrderHistoryGuard, crossedPlaceOrderMidpoint } from "../components/admin/PlaceOrderEditor";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const source = readFileSync(path.join(root, "components/admin/PlaceOrderEditor.tsx"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
const moduleObject = { exports: {} as { default: typeof PlaceOrderEditor; installLegacyPlaceOrderHistoryGuard: typeof installLegacyPlaceOrderHistoryGuard; crossedPlaceOrderMidpoint: typeof crossedPlaceOrderMidpoint } };
vm.runInNewContext(compiled, {
    exports: moduleObject.exports,
    module: moduleObject,
    require: (id: string) => {
        if (id === "@/app/actions/place-order") return {};
        if (id === "@/lib/place-order") return require("../lib/place-order.ts");
        return require(id);
    },
});

const places = [
    { id: "first", title: { en: "First", ar: "الأول", he: "ראשון" }, hidden: false },
    { id: "second", title: { en: "Second", ar: "الثاني", he: "שני" }, hidden: true },
];

for (const lang of ["en", "ar", "he"] as const) {
    test(`order editor renders the same order and accessible controls in ${lang}`, () => {
        const dictionary = JSON.parse(readFileSync(path.join(root, `dictionaries/${lang}.json`), "utf8")).placeOrder;
        const markup = renderToStaticMarkup(React.createElement(moduleObject.exports.default, { initialPlaces: places, initialRevision: "revision", lang, dictionary }));
        assert.ok(markup.indexOf('data-place-id="first"') < markup.indexOf('data-place-id="second"'));
        assert.ok(markup.includes(places[0].title[lang]));
        assert.ok(markup.includes(dictionary.hidden));
        assert.ok(markup.includes(dictionary.moveUp.replace("{title}", places[0].title[lang])));
        assert.ok(markup.includes(dictionary.moveDown.replace("{title}", places[1].title[lang])));
        assert.match(markup, /type="search"/);
        assert.match(markup, /type="number"/);
        assert.match(markup, /min="1" max="2" step="1"/);
        assert.ok(markup.includes(dictionary.positionFor.replace("{title}", places[1].title[lang])));
        assert.match(markup, /aria-live="polite"/);
        assert.doesNotMatch(markup, /role="status"/);
        assert.match(markup, /<button[^>]*disabled=""[^>]*>[^<]+<\/button>/);
    });
}

test("all order editor dictionary keys and interpolation tokens match", () => {
    const dictionaries = ["en", "ar", "he"].map(lang => JSON.parse(readFileSync(path.join(root, `dictionaries/${lang}.json`), "utf8")).placeOrder as Record<string, string>);
    for (const dictionary of dictionaries) {
        assert.deepEqual(Object.keys(dictionary).sort(), Object.keys(dictionaries[0]).sort());
        for (const [key, value] of Object.entries(dictionary)) {
            assert.ok(value.trim());
            assert.deepEqual(value.match(/\{\w+\}/g)?.sort(), dictionaries[0][key].match(/\{\w+\}/g)?.sort());
        }
    }
});

function historyHarness(confirmLeave: () => boolean) {
    const entries = ["/places", "/area-51-sec/place-order"];
    let position = 1;
    let routed = "";
    const listeners = new Set<(event: PopStateEvent) => void>();
    const pending: Array<() => void> = [];
    const dispatch = () => {
        let stopped = false;
        const event = { stopImmediatePropagation: () => { stopped = true; } } as PopStateEvent;
        for (const listener of listeners) listener(event);
        if (!stopped) routed = entries[position];
    };
    const browser = {
        history: { forward: () => { pending.push(() => { position += 1; dispatch(); }); } },
        addEventListener: (_type: string, listener: (event: PopStateEvent) => void, capture: boolean) => { assert.equal(capture, true); listeners.add(listener); },
        removeEventListener: (_type: string, listener: (event: PopStateEvent) => void) => { listeners.delete(listener); },
    } as unknown as Parameters<typeof installLegacyPlaceOrderHistoryGuard>[0];
    const dispose = moduleObject.exports.installLegacyPlaceOrderHistoryGuard(browser, confirmLeave);
    return { entries, dispose, back: () => { position -= 1; dispatch(); }, flush: () => { while (pending.length) pending.shift()!(); }, state: () => ({ position, routed, listeners: listeners.size }) };
}

test("legacy browser Back cancellation preserves editor and history without extra entries", () => {
    let confirmations = 0;
    const harness = historyHarness(() => { confirmations++; return false; });
    harness.back();
    assert.equal(harness.state().routed, "");
    harness.flush();
    assert.deepEqual(harness.state(), { position: 1, routed: "", listeners: 1 });
    assert.equal(confirmations, 1);
    assert.equal(harness.entries.length, 2);
    harness.dispose();
    harness.back();
    assert.equal(harness.state().routed, "/places");
    assert.equal(confirmations, 1);
});

test("legacy browser accepted Back navigates normally without a trap", () => {
    const harness = historyHarness(() => true);
    harness.back();
    assert.equal(harness.state().routed, "/places");
    harness.dispose();
    assert.equal(harness.state().listeners, 0);
    assert.equal(harness.entries.length, 2);
});

test("saving during Back restoration suppresses the pending event and then removes guard", () => {
    const harness = historyHarness(() => false);
    harness.back();
    harness.dispose();
    harness.flush();
    assert.deepEqual(harness.state(), { position: 1, routed: "", listeners: 0 });
});

test("drag reorders only across the midpoint in the pointer or scroll movement direction", () => {
    const crossed = moduleObject.exports.crossedPlaceOrderMidpoint;
    assert.equal(crossed(0, 1, 190, 180, 20), true);
    assert.equal(crossed(0, 1, 170, 180, 20), false);
    assert.equal(crossed(1, 0, 170, 180, -20), true);
    assert.equal(crossed(1, 0, 190, 180, -20), false);
    assert.equal(crossed(1, 0, 170, 180, 20), false);
    assert.equal(crossed(0, 1, 190, 180, -20), false);
    assert.equal(crossed(0, 1, 190, 180, 0), false);
    assert.equal(crossed(1, 0, 170, 180, 0), false);
});
