import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

function loadInteractionListener() {
    try {
        return require("../lib/first-meaningful-interaction.ts") as typeof import("../lib/first-meaningful-interaction");
    } catch (error) {
        assert.fail(`interaction listener is unavailable: ${String(error)}`);
    }
}

test("waits for the first meaningful interaction and fires only once", () => {
    const { listenForFirstMeaningfulInteraction } = loadInteractionListener();
    const target = new EventTarget();
    let calls = 0;

    const cleanup = listenForFirstMeaningfulInteraction(target, () => {
        calls += 1;
    });

    assert.equal(calls, 0);
    target.dispatchEvent(new Event("scroll"));
    target.dispatchEvent(new Event("pointerdown"));
    target.dispatchEvent(new Event("keydown"));
    assert.equal(calls, 1);

    cleanup();
});

test("cleanup prevents a pending interaction callback", () => {
    const { listenForFirstMeaningfulInteraction } = loadInteractionListener();
    const target = new EventTarget();
    let calls = 0;

    const cleanup = listenForFirstMeaningfulInteraction(target, () => {
        calls += 1;
    });

    cleanup();
    target.dispatchEvent(new Event("scroll"));
    assert.equal(calls, 0);
});
