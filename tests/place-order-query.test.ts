import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
const loader = require("node:module") as { _load: (id: string, parent: unknown, main: boolean) => unknown };
const load = loader._load;
let calls: [string, unknown][] = [];
loader._load = function(id, parent, main) {
    if (id.startsWith("@/components/")) return () => null;
    if (id === "@/lib/auth") return { getCurrentUser: async () => null };
    if (id === "@/lib/mongodb") return async () => {};
    if (id === "@/lib/db/places") return { toPublicPlaceDTO: (value: unknown) => value };
    if (id === "@/database/place.model") return { find(filter: unknown) {
        calls.push(["find", filter]);
        const query = {
            select(value: unknown) { calls.push(["select", value]); return query; },
            sort(value: unknown) { calls.push(["sort", value]); return query; },
            limit(value: unknown) { calls.push(["limit", value]); return query; },
            async lean() { return []; },
        };
        return query;
    } };
    return load.call(this, id, parent, main);
};
const { default: PlacesPage } = require("../app/[lang]/(main)/places/page.tsx") as typeof import("../app/[lang]/(main)/places/page");
loader._load = load;

for (const lang of ["en", "ar", "he"] as const) {
    test(`${lang}: public directory sorts in database before the existing limit and preserves filters`, async () => {
        calls = [];
        await PlacesPage({ params: Promise.resolve({ lang }), searchParams: Promise.resolve({ search: "mountain", category: "nature", price: "free", villages: "majdal-shams" }) });
        assert.deepEqual(calls.map(([name]) => name), ["find", "select", "sort", "limit"]);
        assert.deepEqual(calls[2][1], { publicOrder: 1, createdAt: -1, _id: -1 });
        assert.equal(calls[3][1], 100);
        const filter = calls[0][1] as Record<string, unknown>;
        assert.deepEqual(filter.hidden, { $ne: true });
        assert.deepEqual(filter.category, { $regex: "nature", $options: "i" });
        assert.equal(filter.price, "free");
        assert.ok(Array.isArray(filter.$and));
        assert.ok(Array.isArray(filter.$or));
    });
}

test("explicit top-rated sort keeps its independent behavior", async () => {
    calls = [];
    await PlacesPage({ params: Promise.resolve({ lang: "en" }), searchParams: Promise.resolve({ sort: "top-rated" }) });
    assert.deepEqual(calls[2][1], { averageRating: -1, reviewsCount: -1 });
});

test("new and legacy place documents have no automatic manual rank; public DTO excludes order internals", async () => {
    process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/golan-order-tests";
    const { default: Place } = require("../database/place.model.ts") as typeof import("../database/place.model");
    const { toPublicPlaceDTO } = require("../lib/db/places.ts") as typeof import("../lib/db/places");
    const place = new Place({ title: { en: "New place" } });
    assert.equal(place.publicOrder, undefined);
    assert.equal(place.publicOrderRevision, undefined);
    const legacy = Place.hydrate({ title: { en: "Legacy" }, createdAt: new Date(0) });
    assert.equal(legacy.publicOrder, undefined);
    const dto = toPublicPlaceDTO({ ...place.toObject(), publicOrder: 2, publicOrderRevision: "internal" });
    assert.equal("publicOrder" in dto, false);
    assert.equal("publicOrderRevision" in dto, false);
});
