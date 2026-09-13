import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
require("../scripts/lib/register-typescript.cjs");
const { PLACE_TAG_BACKFILL } = require("../scripts/data/place-tag-backfill.ts") as typeof import("../scripts/data/place-tag-backfill");
const { assessPlaceTagBackfill, runPlaceTagBackfill, parseBackfillArgs } = require("../scripts/lib/place-tag-backfill.ts") as typeof import("../scripts/lib/place-tag-backfill");
const { PLACE_TAG_KEYS } = require("../lib/place-tags.ts") as typeof import("../lib/place-tags");
type Snapshot = import("../scripts/lib/place-tag-backfill").PlaceTagSnapshot;

const expectedSlugs = `active-way al-ajeed-horse-farm buqata-park golan-atv-adventures har-odem-horse-farm majdal-shams-park masade-park owais-the-farmer
2eat-restaurant al-jalaa-supermarket-bakery al-yasmeen-restaurant amore-chocolate bab-sharqi-restaurant-cafe bahaa-abu-zaid-sweets bin-al-sindian-coffee-nuts burger-place-majdal-shams crunch-munch-burger downtown-liquor-store falafel-hagolan golan-fish-market hagolan-falafel-restaurant in-house-market izzat-abu-zaid-sweets jam-pizza-truck kiwi-stein-juices-desserts merci-restaurant-cafe mor-meat-restaurant moringa-cafe nakha shawarma-shamia sohela-kitchen steakwood tabon-al-saha the-bronx weam-khater-butcher-shop weam-meat-store yfc-roasted-chicken
banias-church prophet-al-khidr-shrine prophet-al-yafouri-shrine prophet-elijah-shrine prophet-sultan-ibrahim-shrine
el-barbary-barber-shop pet-house izone
aml-pharmacy clalit-clinic-pharmacy-majdal-shams family-medical-center golan-medical-center-polyclinic mouwsat-pharmacy
ain-lubna bab-al-hawa-warm-water-pipe big-juba ein-al-qaqan ein-fit golan-trail-segment-2 hill-of-shouts-viewpoint masade-forest nahal-saar-bridge-viewpoint nimrod-viewpoint ram-lake ronen-lookout the-syrian-headquarters
dahab-jewelry golden-box joy-beauty-personal-care jumclo-mens-fashion mad-perfumer masade-friday-market vera-boutique wedad-zimmer`.split(/\s+/);

const mappings = { "ram-lake": { expectedCategory: "nature", placeTags: ["water", "viewpoint", "hiking"] } };
function snapshot(placeTags?: unknown): Snapshot {
  return { id: "one", slug: "ram-lake", category: "nature", ...(placeTags === undefined ? {} : { placeTags }) };
}

test("curated mapping covers all 71 exact inventory slugs with valid ordered keys", () => {
  assert.equal(expectedSlugs.length, 71);
  assert.deepEqual(Object.keys(PLACE_TAG_BACKFILL).sort(), expectedSlugs.sort());
  const counts: Record<string, number> = {};
  for (const entry of Object.values(PLACE_TAG_BACKFILL)) {
    counts[entry.expectedCategory] = (counts[entry.expectedCategory] ?? 0) + 1;
    assert.ok(entry.placeTags.length > 0 && entry.placeTags.length <= 8);
    assert.equal(new Set(entry.placeTags).size, entry.placeTags.length);
    for (const key of entry.placeTags) assert.ok(PLACE_TAG_KEYS.includes(key));
  }
  assert.deepEqual(counts, { activities: 8, "food-drink": 29, "holy-places": 5, "local-services": 3, "medical-services": 5, nature: 13, shopping: 7, stays: 1 });
  assert.deepEqual(PLACE_TAG_BACKFILL["ram-lake"].placeTags, ["water", "viewpoint", "hiking"]);
});

test("merge keeps existing priorities and appends only missing curated values", () => {
  const result = assessPlaceTagBackfill(snapshot(["hiking", "water"]), mappings["ram-lake"]);
  assert.equal(result.status, "would-update");
  assert.deepEqual(result.finalTags, ["hiking", "water", "viewpoint"]);
  assert.deepEqual(result.additions, ["viewpoint"]);
  const again = assessPlaceTagBackfill(snapshot(result.finalTags), mappings["ram-lake"]);
  assert.equal(again.status, "unchanged");
  assert.deepEqual(again.finalTags, result.finalTags);
});

test("old missing field is treated as empty, but malformed existing values are skipped", () => {
  assert.deepEqual(assessPlaceTagBackfill(snapshot(), mappings["ram-lake"]).finalTags, ["water", "viewpoint", "hiking"]);
  for (const invalid of [null, "water", ["unknown"], ["water", "water"], [false], ["constructor"], ["__proto__"], PLACE_TAG_KEYS.slice(0, 9)]) {
    assert.equal(assessPlaceTagBackfill(snapshot(invalid), mappings["ram-lake"]).status, "invalid-existing");
  }
});

test("assessment distinguishes category mismatches, invalid mapping, and overflow", () => {
  assert.equal(assessPlaceTagBackfill({ ...snapshot(), category: "stays" }, mappings["ram-lake"]).status, "category-mismatch");
  for (const tags of [["unknown"], ["toString"], ["water", "water"], [], PLACE_TAG_KEYS.slice(0, 9)]) {
    assert.equal(assessPlaceTagBackfill(snapshot(), { expectedCategory: "nature", placeTags: tags }).status, "invalid-mapping");
  }
  assert.equal(assessPlaceTagBackfill(snapshot(), { expectedCategory: "invalid", placeTags: ["water"] }).status, "invalid-mapping");
  assert.equal(assessPlaceTagBackfill(snapshot(["food", "cafe", "bakery", "sweets", "groceries", "butcher", "fish", "spices"]), mappings["ram-lake"]).status, "exceeds-limit");
});

test("CLI defaults to dry-run and accepts writes only with exact explicit flag", () => {
  assert.deepEqual(parseBackfillArgs([]), { write: false });
  assert.deepEqual(parseBackfillArgs(["--write"]), { write: true });
  assert.throws(() => parseBackfillArgs(["--writ"]));
  assert.throws(() => parseBackfillArgs(["--write=true"]));
});

test("dry-run reports each inventory case without rereading or writing", async () => {
  const report = await runPlaceTagBackfill({
    list: async () => [snapshot(), { id: "other", slug: "unmapped", category: "nature" }],
    reread: async () => { throw new Error("dry run must not reread"); },
    compareAndSet: async () => { throw new Error("dry run must not write"); },
  }, { ...mappings, missing: { expectedCategory: "nature", placeTags: ["water"] } });
  assert.equal(report.write, false);
  assert.equal(report.records, 2);
  assert.deepEqual(report.results.map((r) => [r.slug, r.status]), [["ram-lake", "would-update"], ["missing", "missing-slug"], ["unmapped", "unmapped-place"]]);
});

test("invalid mappings are reported even when their slug is absent", async () => {
  const report = await runPlaceTagBackfill({ list: async () => [], reread: async () => null, compareAndSet: async () => { throw new Error("write"); } }, { bad: { expectedCategory: "nature", placeTags: ["unknown"] } });
  assert.equal(report.results[0].status, "invalid-mapping");
});

test("write runner rereads and preserves newly added administrator priorities", async () => {
  let writes = 0;
  const current = snapshot(["cafe", "hiking"]);
  const report = await runPlaceTagBackfill({
    list: async () => [snapshot()], reread: async (id) => { assert.equal(id, "one"); return current; },
    compareAndSet: async (before, tags) => { writes++; assert.deepEqual(before, current); assert.deepEqual(tags, ["cafe", "hiking", "water", "viewpoint"]); return true; },
  }, mappings, { write: true });
  assert.equal(writes, 1);
  assert.equal(report.results[0].status, "updated");
});

test("write runner skips changed identity, invalid rereads, and compare-and-set conflicts", async () => {
  for (const current of [null, { ...snapshot(), slug: "renamed" }, { ...snapshot(), category: "stays" }, snapshot(["unknown"])]) {
    let writes = 0;
    const report = await runPlaceTagBackfill({ list: async () => [snapshot()], reread: async () => current, compareAndSet: async () => { writes++; return true; } }, mappings, { write: true });
    assert.equal(writes, 0);
    assert.notEqual(report.results[0].status, "updated");
  }
  const report = await runPlaceTagBackfill({ list: async () => [snapshot()], reread: async () => snapshot(), compareAndSet: async () => false }, mappings, { write: true });
  assert.equal(report.results[0].status, "concurrent-change");
});

test("duplicate live slugs are unsafe and never written", async () => {
  const report = await runPlaceTagBackfill({ list: async () => [snapshot(), { ...snapshot(), id: "two" }], reread: async () => { throw new Error("unsafe reread"); }, compareAndSet: async () => { throw new Error("unsafe write"); } }, mappings, { write: true });
  assert.equal(report.results[0].status, "duplicate-slug");
});
