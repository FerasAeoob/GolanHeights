import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
const order = require("../lib/place-order.ts") as typeof import("../lib/place-order");

test("default listing sort puts unranked newest places first and uses a stable tie breaker", () => {
    assert.deepEqual(order.getPlacesPageSort(), { publicOrder: 1, createdAt: -1, _id: -1 });
    assert.deepEqual(order.getPlacesPageSort("unknown"), order.getPlacesPageSort());
    assert.deepEqual(order.getPlacesPageSort("top-rated"), { averageRating: -1, reviewsCount: -1 });
});

test("moving preserves every id and supports moves in both directions", () => {
    const ids = ["a", "b", "c", "d"];
    assert.deepEqual(order.movePlaceOrder(ids, 3, 0), ["d", "a", "b", "c"]);
    assert.deepEqual(order.movePlaceOrder(ids, 0, 3), ["b", "c", "d", "a"]);
    assert.deepEqual(order.movePlaceOrder(ids, 0, -1), ids);
    assert.deepEqual(order.movePlaceOrder(ids, 4, 0), ids);
    assert.deepEqual(ids, ["a", "b", "c", "d"]);
});

test("save input rejects malformed, duplicate, uppercase-equivalent IDs and invalid revisions", () => {
    const id = "a".repeat(24);
    const revision = "b".repeat(64);
    assert.equal(order.placeOrderInputSchema.safeParse({ ids: [id], revision }).success, true);
    for (const ids of [[id, id], [id, id.toUpperCase()], ["bad"], [12]]) {
        assert.equal(order.placeOrderInputSchema.safeParse({ ids, revision }).success, false);
    }
    assert.equal(order.placeOrderInputSchema.safeParse({ ids: [id], revision: "" }).success, false);
});
