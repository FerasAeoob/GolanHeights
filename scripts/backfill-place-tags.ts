/**
 * Review-only by default: node scripts/backfill-place-tags.ts
 * Writes require separate authorization and an explicit --write argument.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { setServers } from "node:dns/promises";
import type { PlaceTagSnapshot, PlaceTagBackfillStore } from "./lib/place-tag-backfill";

const require = createRequire(import.meta.url);
require("./lib/register-typescript.cjs");
const { PLACE_TAG_BACKFILL } = require("./data/place-tag-backfill.ts") as typeof import("./data/place-tag-backfill");
const { parseBackfillArgs, runPlaceTagBackfill } = require("./lib/place-tag-backfill.ts") as typeof import("./lib/place-tag-backfill");

async function main() {
  const options = parseBackfillArgs(process.argv.slice(2));
  const dotenv = require("dotenv") as typeof import("dotenv");
  dotenv.config({ path: [".env.local", ".env"], quiet: true });
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  // Match application DNS configuration; raw driver access cannot create model indexes.
  setServers(["1.1.1.1", "8.8.8.8"]);
  const { mongo } = require("mongoose") as typeof import("mongoose");
  const client = new mongo.MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const collection = client.db().collection("places");
    const projection = { _id: 1, "slug.en": 1, category: 1, placeTags: 1 };
    const toSnapshot = (doc: import("mongoose").mongo.WithId<import("mongoose").mongo.Document>): PlaceTagSnapshot => ({
      id: doc._id.toString(),
      slug: doc.slug?.en,
      category: doc.category,
      ...(Object.hasOwn(doc, "placeTags") ? { placeTags: doc.placeTags } : {}),
    });
    const store: PlaceTagBackfillStore = {
      list: async () => (await collection.find({}, { projection }).toArray()).map(toSnapshot),
      reread: async (id) => {
        const current = await collection.findOne({ _id: new mongo.ObjectId(id) }, { projection });
        return current ? toSnapshot(current) : null;
      },
      compareAndSet: async (before, tags) => {
        if (!options.write) throw new Error("Writes are disabled in dry-run mode");
        const tagsGuard = Object.hasOwn(before, "placeTags")
          ? { placeTags: { $exists: true }, $expr: { $eq: ["$placeTags", { $literal: before.placeTags }] } }
          : { placeTags: { $exists: false } };
        const result = await collection.updateOne({
          _id: new mongo.ObjectId(before.id), "slug.en": before.slug,
          category: before.category, ...tagsGuard,
        }, { $set: { placeTags: tags, updatedAt: new Date() } });
        return result.matchedCount === 1;
      },
    };
    const report = await runPlaceTagBackfill(store, PLACE_TAG_BACKFILL, options);
    const counts: Record<string, number> = {};
    for (const result of report.results) counts[result.status] = (counts[result.status] ?? 0) + 1;
    console.log(JSON.stringify({ ...report, mode: options.write ? "write" : "dry-run", counts }, null, 2));
    if (report.results.some((r) => !["unchanged", "would-update", "updated"].includes(r.status))) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    // Do not print connection errors that may contain credentials or connection strings.
    console.error("Place-tag backfill failed.", error instanceof Error ? error.name : "Unknown error");
    process.exitCode = 1;
  });
}
