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

class ScrollTarget extends EventTarget {
    scrollY = 0;
    innerHeight = 800;
    document = {
        documentElement: {
            scrollHeight: 1800,
        },
    };
}

test("fires once only after scrolling 20% of the scrollable distance", () => {
    const { listenForFirstMeaningfulInteraction } = loadInteractionListener();
    const target = new ScrollTarget();
    let calls = 0;

    const cleanup = listenForFirstMeaningfulInteraction(target, () => {
        calls += 1;
    });

    assert.equal(calls, 0);
    target.dispatchEvent(new Event("pointerdown"));
    target.dispatchEvent(new Event("keydown"));
    assert.equal(calls, 0);

    target.scrollY = 199;
    target.dispatchEvent(new Event("scroll"));
    assert.equal(calls, 0);

    target.scrollY = 200;
    target.dispatchEvent(new Event("scroll"));
    assert.equal(calls, 1);

    target.scrollY = 800;
    target.dispatchEvent(new Event("scroll"));
    assert.equal(calls, 1);

    cleanup();
});

test("cleanup prevents a pending scroll-threshold callback", () => {
    const { listenForFirstMeaningfulInteraction } = loadInteractionListener();
    const target = new ScrollTarget();
    let calls = 0;

    const cleanup = listenForFirstMeaningfulInteraction(target, () => {
        calls += 1;
    });

    cleanup();
    target.scrollY = 200;
    target.dispatchEvent(new Event("scroll"));
    assert.equal(calls, 0);
});
