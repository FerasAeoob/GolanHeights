import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("PlaceTags stays server rendered and uses semantic capped defensive output", () => {
  const source = read("components/places/PlaceTags.tsx");

  assert.doesNotMatch(source, /^\s*["']use client["'];?/m);
  assert.match(source, /:\s*unknown\b/);
  assert.match(source, /getPublicPlaceTags|normalizePlaceTags/);
  assert.match(source, /return null/);
  assert.match(source, /<ul[\s\S]*aria-label=\{dictionary\.sectionLabel\}/);
  assert.match(source, /aria-hidden="true"/);
});

test("PlaceTagSelector uses accessible native controls and polite reorder feedback", () => {
  const source = read("components/admin/PlaceTagSelector.tsx");

  assert.match(source, /^\s*["']use client["'];?/m);
  assert.match(source, /MAX_PLACE_TAGS/);
  assert.match(source, /MAX_PUBLIC_PLACE_TAGS/);
  assert.match(source, /addPlaceTag/);
  assert.match(source, /removePlaceTag/);
  assert.match(source, /movePlaceTag/);
  assert.match(source, /aria-pressed=\{/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /focus\(\)/);
  assert.match(source, /data-tag-action=/);
  assert.match(source, /dictionary\.shownPublicly/);
  assert.match(source, /dictionary\.savedMetadata/);
  assert.match(source, /<details/);
});

test("PlaceForm carries ordered placeTags through initialization and selector integration", () => {
  const source = read("components/admin/PlaceForm.tsx");

  assert.match(source, /PlaceTagSelector/);
  assert.match(source, /normalizePlaceTags/);
  assert.match(source, /placeTags:\s*\[\]/);
  assert.match(source, /placeTags:\s*normalizePlaceTags\(initialData\.placeTags\)/);
  assert.match(source, /selected=\{form\.placeTags\}/);
  assert.match(source, /onChange=\{\(placeTags\)\s*=>\s*setForm/);
});

test("place detail page renders public tags after the title and before the divider", () => {
  const source = read("app/[lang]/(main)/places/[slug]/page.tsx");

  assert.match(source, /PlaceTags/);
  assert.match(source, /dict\.placeTags/);

  const titleIndex = source.indexOf("{place.title[lang] || place.title.en}");
  const tagsIndex = source.indexOf("<PlaceTags");
  const dividerIndex = source.indexOf('<div className="h-px w-full bg-gray-400 " />');

  assert.ok(titleIndex >= 0, "expected the page title");
  assert.ok(tagsIndex > titleIndex, "expected tags after the title");
  assert.ok(dividerIndex > tagsIndex, "expected divider after tags");
});
