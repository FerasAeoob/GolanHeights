import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import type { NavbarScrollState } from "../components/navbar-scroll";

const { getNextNavbarScrollState } = createRequire(import.meta.url)(
    "../components/navbar-scroll.ts",
) as typeof import("../components/navbar-scroll");

const visibleAtTop: NavbarScrollState = {
    isVisible: true,
    previousScrollY: 0,
    accumulatedDelta: 0,
};

const scroll = (
    state: NavbarScrollState,
    scrollY: number,
    overrides: Partial<Parameters<typeof getNextNavbarScrollState>[1]> = {},
) => getNextNavbarScrollState(state, {
    scrollY,
    isEnabled: true,
    canScroll: true,
    mustStayVisible: false,
    ...overrides,
});

test("keeps the navbar visible near the top", () => {
    const state = scroll(visibleAtTop, 80);

    assert.equal(state.isVisible, true);
    assert.equal(state.previousScrollY, 80);
});

test("accumulates small downward movements before hiding past 80px", () => {
    let state = scroll(visibleAtTop, 80);
    state = scroll(state, 84);
    assert.equal(state.isVisible, true);

    state = scroll(state, 88);
    assert.equal(state.isVisible, false);
});

test("shows the navbar after an upward movement reaches the threshold", () => {
    const hiddenState: NavbarScrollState = {
        isVisible: false,
        previousScrollY: 160,
        accumulatedDelta: 0,
    };

    const state = scroll(hiddenState, 152);

    assert.equal(state.isVisible, true);
});

test("ignores tiny direction changes that would otherwise flicker", () => {
    const hiddenState: NavbarScrollState = {
        isVisible: false,
        previousScrollY: 160,
        accumulatedDelta: 0,
    };

    let state = scroll(hiddenState, 157);
    state = scroll(state, 160);

    assert.equal(state.isVisible, false);
});

test("forces the navbar visible while a connected interaction is open", () => {
    const hiddenState: NavbarScrollState = {
        isVisible: false,
        previousScrollY: 160,
        accumulatedDelta: 0,
    };

    const state = scroll(hiddenState, 160, { mustStayVisible: true });

    assert.equal(state.isVisible, true);
});

test("keeps the navbar visible on desktop and on pages that cannot scroll", () => {
    const hiddenState: NavbarScrollState = {
        isVisible: false,
        previousScrollY: 160,
        accumulatedDelta: 0,
    };

    assert.equal(scroll(hiddenState, 160, { isEnabled: false }).isVisible, true);
    assert.equal(scroll(hiddenState, 160, { canScroll: false }).isVisible, true);
});
