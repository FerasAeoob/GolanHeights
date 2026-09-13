import { CATEGORY_SLUGS } from "../../lib/categories";
import { isValidPlaceTags, MAX_PLACE_TAGS, type PlaceTagKey } from "../../lib/place-tags";

export interface PlaceTagMapping {
  expectedCategory: string;
  placeTags: readonly string[];
}

/** Raw values are deliberately retained: backfill must never repair legacy data. */
export interface PlaceTagSnapshot {
  id: string;
  slug: unknown;
  category: unknown;
  placeTags?: unknown;
}

export type BackfillStatus = "unchanged" | "would-update" | "updated" | "missing-slug" |
  "category-mismatch" | "unmapped-place" | "invalid-mapping" | "invalid-existing" |
  "exceeds-limit" | "duplicate-slug" | "changed-identity" | "concurrent-change";

export interface BackfillResult {
  slug: unknown;
  id?: string;
  status: BackfillStatus;
  currentTags?: unknown;
  additions?: PlaceTagKey[];
  finalTags?: PlaceTagKey[];
}

export interface PlaceTagBackfillStore {
  list(): Promise<PlaceTagSnapshot[]>;
  reread(id: string): Promise<PlaceTagSnapshot | null>;
  /** Atomically match id, exact slug/category, and the complete original tag value. */
  compareAndSet(before: PlaceTagSnapshot, tags: PlaceTagKey[]): Promise<boolean>;
}

function validMapping(value: unknown): value is PlaceTagMapping {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<PlaceTagMapping>;
  return CATEGORY_SLUGS.some((category) => category === entry.expectedCategory) &&
    isValidPlaceTags(entry.placeTags) && entry.placeTags.length > 0;
}

export function assessPlaceTagBackfill(place: PlaceTagSnapshot, mapping: unknown): BackfillResult {
  const base = { slug: place.slug, id: place.id, currentTags: place.placeTags };
  if (!validMapping(mapping)) return { ...base, status: "invalid-mapping" };
  if (place.category !== mapping.expectedCategory) return { ...base, status: "category-mismatch" };
  const current = Object.hasOwn(place, "placeTags") ? place.placeTags : [];
  if (!isValidPlaceTags(current)) return { ...base, status: "invalid-existing" };
  const additions = mapping.placeTags.filter((key) => !current.includes(key as PlaceTagKey)) as PlaceTagKey[];
  const finalTags = [...current, ...additions];
  if (finalTags.length > MAX_PLACE_TAGS) return { ...base, additions, finalTags, status: "exceeds-limit" };
  // Validate the complete result independently of the append operation.
  if (!isValidPlaceTags(finalTags)) return { ...base, status: "invalid-existing" };
  return { ...base, additions, finalTags, status: additions.length ? "would-update" : "unchanged" };
}

export function parseBackfillArgs(args: readonly string[]): { write: boolean } {
  if (args.length === 0) return { write: false };
  if (args.length === 1 && args[0] === "--write") return { write: true };
  throw new Error("Usage: node scripts/backfill-place-tags.ts [--write]");
}

export async function runPlaceTagBackfill(
  store: PlaceTagBackfillStore,
  mappings: Readonly<Record<string, unknown>>,
  options: { write?: boolean } = {},
) {
  const places = await store.list();
  const results: BackfillResult[] = [];
  const bySlug = new Map<unknown, PlaceTagSnapshot[]>();
  for (const place of places) bySlug.set(place.slug, [...(bySlug.get(place.slug) ?? []), place]);
  for (const [slug, mapping] of Object.entries(mappings)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !validMapping(mapping)) {
      results.push({ slug, status: "invalid-mapping" });
      continue;
    }
    const matching = bySlug.get(slug) ?? [];
    if (!matching.length) { results.push({ slug, status: "missing-slug" }); continue; }
    if (matching.length !== 1) { results.push({ slug, status: "duplicate-slug" }); continue; }
    const place = matching[0];
    let result = assessPlaceTagBackfill(place, mapping);
    if (options.write === true && result.status === "would-update") {
      const current = await store.reread(place.id);
      if (!current || current.id !== place.id || current.slug !== slug) {
        result = { slug, id: place.id, status: "changed-identity" };
      } else {
        result = assessPlaceTagBackfill(current, mapping);
        if (result.status === "would-update" && result.finalTags) {
          const updated = await store.compareAndSet(current, result.finalTags);
          result = { ...result, status: updated ? "updated" : "concurrent-change" };
        }
      }
    }
    results.push(result);
  }
  for (const place of places) {
    if (typeof place.slug !== "string" || !Object.hasOwn(mappings, place.slug)) {
      results.push({ slug: place.slug, id: place.id, currentTags: place.placeTags, status: "unmapped-place" });
    }
  }
  return { write: options.write === true, mappings: Object.keys(mappings).length, records: places.length, results };
}
