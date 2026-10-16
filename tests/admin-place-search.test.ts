import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");

test("admin search validates query types and length, and normalizes pagination", () => {
    const { parseAdminPlaceSearch } = require("../lib/admin-place-search.ts");
    assert.deepEqual(parseAdminPlaceSearch({ search: "  Hermon  ", page: "2" }), { query: "Hermon", page: 2, invalid: false });
    for (const search of [["one", "two"], { $regex: ".*" }, "x".repeat(121), "cafe\0north"]) {
        assert.equal(parseAdminPlaceSearch({ search }).invalid, true);
    }
    for (const page of ["-1", "0", "1.5", "Infinity", "1e10", ["2"], "9007199254740992"]) {
        assert.equal(parseAdminPlaceSearch({ page }).page, 1);
    }
    assert.deepEqual(parseAdminPlaceSearch({ search: "   " }), { query: "", page: 1, invalid: false });
});

test("changing or clearing search resets the page and retains unrelated repeated filters", () => {
    const { buildAdminPlaceSearchParams } = require("../lib/admin-place-search.ts");
    assert.equal(buildAdminPlaceSearchParams("page=3&filter=one&filter=two", "  Cafe  ").toString(), "filter=one&filter=two&search=Cafe");
    assert.equal(buildAdminPlaceSearchParams("search=Cafe&page=3&filter=one", "").toString(), "filter=one");
});

type Filter = { $or?: Record<string, { $regex: string; $options: string }>[] };
let calls: [string, unknown][] = [];
let total = 101;
const loader = require("node:module") as { _load: (id: string, parent: unknown, main: boolean) => unknown };
const originalLoad = loader._load;
loader._load = function (id, parent, main) {
    if (id === "@/lib/mongodb") return async () => { calls.push(["connect", null]); };
    if (id === "@/database/place.model") return {
        countDocuments(filter: Filter) { calls.push(["count", filter]); return Promise.resolve(total); },
        find(filter: Filter) {
            calls.push(["find", filter]);
            const query = {
                select(value: unknown) { calls.push(["select", value]); return query; },
                sort(value: unknown) { calls.push(["sort", value]); return query; },
                skip(value: unknown) { calls.push(["skip", value]); return query; },
                limit(value: unknown) { calls.push(["limit", value]); return query; },
                async lean() { return [{ _id: { toString: () => "place-id" }, title: { en: "Cafe" }, slug: { en: "cafe" }, category: "food", featured: false, hidden: true }]; },
            };
            return query;
        },
    };
    return originalLoad.call(this, id, parent, main);
};
let getAdminPlaces: typeof import("../lib/db/admin-places").getAdminPlaces;
test("admin search uses bounded projected queries with stable ordering across pages", async () => {
    ({ getAdminPlaces } = require("../lib/db/admin-places.ts"));
    loader._load = originalLoad;
    calls = [];
    const result = await getAdminPlaces({ search: "cafe", page: "2" });
    assert.equal(result.total, 101);
    assert.equal(result.page, 2);
    assert.equal(result.pageCount, 3);
    assert.equal(result.places[0]._id, "place-id");
    assert.equal(result.places[0].hidden, true);
    assert.deepEqual(calls.map(([name]) => name), ["connect", "count", "find", "select", "sort", "skip", "limit"]);
    assert.deepEqual(calls.find(([name]) => name === "sort")?.[1], { createdAt: -1, _id: -1 });
    assert.equal(calls.find(([name]) => name === "skip")?.[1], 50);
    assert.equal(calls.find(([name]) => name === "limit")?.[1], 50);
    assert.equal(calls.find(([name]) => name === "select")?.[1], "_id title slug category featured hidden");
    assert.deepEqual(calls[1][1], calls[2][1]);
});

test("all title, slug and location translations match regardless of interface language; regex is literal", async () => {
    for (const value of ["CAFE", "مجدل شمس", "מסעדה", "cafe.*(north)+[1]$"]) {
        calls = [];
        await getAdminPlaces({ search: value });
        const filter = calls.find(([name]) => name === "find")![1] as Filter;
        assert.deepEqual(filter.$or!.flatMap(Object.keys).sort(), ["location.name.ar", "location.name.en", "location.name.he", "slug.ar", "slug.en", "slug.he", "title.ar", "title.en", "title.he"]);
        assert.equal("hidden" in filter, false);
        for (const clause of filter.$or!) {
            const pattern = Object.values(clause)[0];
            const regex = new RegExp(pattern.$regex, pattern.$options);
            assert.equal(regex.test(`prefix ${value.toLowerCase()} suffix`), true);
            assert.equal(regex.test("unrelated"), false);
            if (value.includes(".*")) assert.equal(regex.test("cafe anything north1"), false);
        }
    }
});

test("empty results and out-of-range pages stay bounded; invalid search never reaches MongoDB", async () => {
    total = 0;
    calls = [];
    const empty = await getAdminPlaces({ search: "missing", page: "999999" });
    assert.deepEqual(empty.places, []);
    assert.equal(empty.total, 0);
    assert.equal(empty.page, 1);
    total = 101;
    const lastPage = await getAdminPlaces({ page: "999999" });
    assert.equal(lastPage.page, 3);
    assert.equal(calls.findLast(([name]) => name === "skip")?.[1], 100);
    calls = [];
    for (const search of [["one", "two"], "cafe\0north"]) {
        const invalid = await getAdminPlaces({ search });
        assert.equal(invalid.invalid, true);
    }
    assert.deepEqual(calls, []);
    calls = [];
    await getAdminPlaces({ search: "" });
    assert.deepEqual(calls.find(([name]) => name === "find")?.[1], {});
});
