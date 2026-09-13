import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import type { CategorySlug } from "../lib/categories";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/golanwiki-tests";

const {
  PLACE_TAGS,
  PLACE_TAG_KEYS,
  PLACE_TAG_GROUPS,
  MAX_PLACE_TAGS,
  MAX_PUBLIC_PLACE_TAGS,
  addPlaceTag,
  getPlaceTagOptions,
  getPublicPlaceTags,
  isPlaceTagKey,
  isValidPlaceTags,
  movePlaceTag,
  normalizePlaceTags,
  removePlaceTag,
} = require("../lib/place-tags.ts") as typeof import("../lib/place-tags");
const { default: HorseRidingIcon } = require(
  "../components/icons/HorseRidingIcon.tsx",
) as typeof import("../components/icons/HorseRidingIcon");
const { default: Place } = require("../database/place.model.ts") as typeof import("../database/place.model");
const { UpdatePlaceSchema, createplaceschema } = require(
  "../database/place.schema.ts",
) as typeof import("../database/place.schema");
const {
  normalizePlaceReadResult,
  toPublicPlaceDTO,
} = require("../lib/db/places.ts") as typeof import("../lib/db/places");

const dictionaries = {
  en: require("../dictionaries/en.json") as typeof import("../dictionaries/en.json"),
  ar: require("../dictionaries/ar.json") as typeof import("../dictionaries/ar.json"),
  he: require("../dictionaries/he.json") as typeof import("../dictionaries/he.json"),
};

const expectedKeys = [
  "food",
  "cafe",
  "bakery",
  "sweets",
  "groceries",
  "butcher",
  "fish",
  "spices",
  "wineSpirits",
  "hiking",
  "viewpoint",
  "water",
  "horseRiding",
  "atv",
  "cycling",
  "camping",
  "cherryPicking",
  "picnic",
  "shade",
  "playground",
  "park",
  "outdoorSeating",
  "pharmacy",
  "medical",
  "medicalSupplies",
  "stay",
  "holySite",
  "history",
  "shopping",
  "gifts",
  "jewelry",
  "fashion",
  "beauty",
  "grooming",
  "petSupplies",
  "printing",
] as const;

const expectedGroupKeys = [
  "foodDrink",
  "nature",
  "activities",
  "facilitiesFamily",
  "health",
  "cultureStay",
  "shoppingServices",
] as const;

function createPlaceModelInput(overrides: Record<string, unknown> = {}) {
  return {
    title: { en: "Horse Farm", he: "חוות סוסים", ar: "مزرعة خيول" },
    slug: { en: "horse-farm", he: "hwwt-swsym", ar: "mzrat-khywl" },
    description: {
      en: "A scenic place with enough detail for validation.",
      he: "מקום יפה עם מספיק פרטים כדי לעבור ולידציה.",
      ar: "مكان جميل مع تفاصيل كافية لاجتياز التحقق.",
    },
    shortDescription: {
      en: "Scenic horse riding",
      he: "רכיבה נופית",
      ar: "ركوب خيل بإطلالة",
    },
    averageRating: 0,
    reviewsCount: 0,
    price: "$$",
    duration: "2 hours",
    openHours: [],
    open: "Daily",
    category: "activities" as CategorySlug,
    mapLink: "https://maps.example.com/place",
    images: [
      {
        url: "https://example.com/place.jpg",
        alt: {
          en: "Horse farm",
          he: "חוות סוסים",
          ar: "مزرعة خيول",
        },
      },
    ],
    location: {
      lat: 33.2701,
      lng: 35.7717,
      name: { en: "Majdal Shams", he: "מג'דל שמס", ar: "مجدل شمس" },
    },
    featured: false,
    ...overrides,
  };
}

function createPlaceCreateInput(overrides: Record<string, unknown> = {}) {
  const modelInput = createPlaceModelInput(overrides);
  return {
    title: modelInput.title,
    slug: { he: modelInput.slug.he, ar: modelInput.slug.ar },
    description: modelInput.description,
    shortDescription: modelInput.shortDescription,
    category: modelInput.category,
    images: modelInput.images,
    location: modelInput.location,
    duration: modelInput.duration,
    price: modelInput.price,
    openHours: modelInput.openHours,
    open: modelInput.open,
    mapLink: modelInput.mapLink,
    featured: modelInput.featured,
    ...overrides,
  };
}

test("registry exports the approved ordered keys and metadata paths", () => {
  assert.deepEqual(PLACE_TAG_KEYS, expectedKeys);
  assert.equal(PLACE_TAG_KEYS.length, 36);
  assert.deepEqual(Object.keys(PLACE_TAGS), expectedKeys);
  assert.deepEqual(Object.keys(PLACE_TAG_GROUPS), expectedGroupKeys);
  assert.equal(MAX_PLACE_TAGS, 8);
  assert.equal(MAX_PUBLIC_PLACE_TAGS, 5);

  const labelKeys = new Set<string>();

  for (const key of PLACE_TAG_KEYS) {
    assert.equal(isPlaceTagKey(key), true);
    assert.equal(PLACE_TAGS[key].labelKey, `placeTags.labels.${key}`);
    assert.equal(expectedGroupKeys.includes(PLACE_TAGS[key].group), true);
    assert.equal(labelKeys.has(PLACE_TAGS[key].labelKey), false);
    labelKeys.add(PLACE_TAGS[key].labelKey);
  }

  for (const groupKey of expectedGroupKeys) {
    assert.equal(PLACE_TAG_GROUPS[groupKey].labelKey, `placeTags.groups.${groupKey}`);
  }
});

test("English, Arabic, and Hebrew dictionaries expose the full place-tag branch", () => {
  for (const dict of Object.values(dictionaries)) {
    assert.ok(dict.placeTags);
    assert.deepEqual(Object.keys(dict.placeTags.groups), expectedGroupKeys);
    assert.deepEqual(Object.keys(dict.placeTags.labels), expectedKeys);
    assert.equal(typeof dict.placeTags.sectionLabel, "string");
    assert.equal(typeof dict.placeTags.adminLabel, "string");
    assert.equal(typeof dict.placeTags.selectedCount, "string");
    assert.equal(typeof dict.placeTags.publicPriorityHelp, "string");
    assert.equal(typeof dict.placeTags.shownPublicly, "string");
    assert.equal(typeof dict.placeTags.savedMetadata, "string");
    assert.equal(typeof dict.placeTags.recommended, "string");
    assert.equal(typeof dict.placeTags.browseAll, "string");
    assert.equal(typeof dict.placeTags.moveEarlier, "string");
    assert.equal(typeof dict.placeTags.moveLater, "string");
    assert.equal(typeof dict.placeTags.remove, "string");
    assert.equal(typeof dict.placeTags.maximumReached, "string");
    assert.equal(typeof dict.placeTags.reorderAnnouncement, "string");
  }
});

test("horse riding icon stays local and renders as an SVG component", () => {
  assert.equal(PLACE_TAGS.horseRiding.icon, HorseRidingIcon);

  const iconElement = React.createElement(HorseRidingIcon, {
    className: "size-5",
    "aria-hidden": "true",
  });

  assert.equal(typeof HorseRidingIcon, "function");
  assert.equal(React.isValidElement(iconElement), true);
});

test("normalizePlaceTags keeps the first valid unique keys in order without silent truncation", () => {
  assert.equal(isValidPlaceTags(["water", "hiking"]), true);
  assert.equal(isValidPlaceTags(["water", "water"]), false);
  assert.equal(isValidPlaceTags("__proto__"), false);
  assert.equal(isPlaceTagKey("__proto__"), false);
  assert.equal(isPlaceTagKey("constructor"), false);

  assert.deepEqual(
    normalizePlaceTags([
      "water",
      "bad",
      "water",
      "hiking",
      "viewpoint",
      "food",
      "cafe",
      "bakery",
      "shopping",
      "gifts",
      "printing",
    ]),
    ["water", "hiking", "viewpoint", "food", "cafe", "bakery", "shopping", "gifts", "printing"],
  );

  assert.deepEqual(normalizePlaceTags(undefined), []);
  assert.deepEqual(normalizePlaceTags("water"), []);
});

test("getPublicPlaceTags keeps only the first five normalized keys", () => {
  assert.deepEqual(
    getPublicPlaceTags([
      "bad",
      "water",
      "hiking",
      "viewpoint",
      "food",
      "cafe",
      "bakery",
      "shopping",
    ]),
    ["water", "hiking", "viewpoint", "food", "cafe"],
  );
});

test("selection helpers append, remove, and move without duplication", () => {
  assert.deepEqual(addPlaceTag(["water"], "hiking"), ["water", "hiking"]);
  assert.deepEqual(addPlaceTag(["water"], "water"), ["water"]);
  assert.deepEqual(addPlaceTag(expectedKeys.slice(0, 8), "shopping"), expectedKeys.slice(0, 8));

  assert.deepEqual(removePlaceTag(["water", "hiking"], "water"), ["hiking"]);
  assert.deepEqual(removePlaceTag(["water"], "food"), ["water"]);

  assert.deepEqual(movePlaceTag(["water", "hiking"], "hiking", -1), ["hiking", "water"]);
  assert.deepEqual(movePlaceTag(["water", "hiking"], "water", 1), ["hiking", "water"]);
  assert.deepEqual(movePlaceTag(["water", "hiking"], "water", -1), ["water", "hiking"]);
});

test("getPlaceTagOptions returns disjoint selected, recommended, and browse-all arrays", () => {
  const options = getPlaceTagOptions(["food", "water"], "food-drink");

  assert.deepEqual(
    options.selected.map((option) => option.key),
    ["food", "water"],
  );
  assert.equal(options.recommended.some((option) => option.key === "food"), false);
  assert.equal(options.recommended.some((option) => option.key === "cafe"), true);
  assert.equal(options.browseAll.some((option) => option.key === "food"), false);
  assert.equal(options.browseAll.some((option) => option.key === "cafe"), false);

  const seenKeys = new Set<string>();
  for (const bucket of [options.selected, options.recommended, options.browseAll]) {
    for (const option of bucket) {
      assert.equal(seenKeys.has(option.key), false);
      seenKeys.add(option.key);
    }
  }

  assert.deepEqual([...seenKeys].sort(), [...PLACE_TAG_KEYS].sort());
});

test("create and update schemas enforce the place-tag write contract", () => {
  const createResult = createplaceschema.parse(createPlaceCreateInput());
  assert.deepEqual(createResult.placeTags, []);

  const explicitEmptyUpdate = UpdatePlaceSchema.parse({ placeTags: [] });
  assert.deepEqual(explicitEmptyUpdate.placeTags, []);

  const omittedUpdate = UpdatePlaceSchema.parse({});
  assert.equal(Object.hasOwn(omittedUpdate, "placeTags"), false);

  assert.equal(
    createplaceschema.safeParse(
      createPlaceCreateInput({ placeTags: ["water", "water"] }),
    ).success,
    false,
  );
  assert.equal(UpdatePlaceSchema.safeParse({ placeTags: ["invalid"] }).success, false);
  assert.equal(
    UpdatePlaceSchema.safeParse({
      placeTags: ["food", "cafe", "bakery", "sweets", "groceries", "butcher", "fish", "spices", "wineSpirits"],
    }).success,
    false,
  );
});

test("Mongoose defaults placeTags and rejects invalid, duplicate, over-limit, and scalar values", () => {
  const validDoc = new Place(createPlaceModelInput());
  assert.deepEqual(validDoc.placeTags, []);
  assert.equal(validDoc.validateSync(), undefined);

  for (const invalidPlaceTags of [
    ["invalid"],
    ["water", "water"],
    ["food", "cafe", "bakery", "sweets", "groceries", "butcher", "fish", "spices", "wineSpirits"],
    "water",
  ]) {
    const doc = new Place(createPlaceModelInput({ placeTags: invalidPlaceTags }));
    const error = doc.validateSync();
    assert.ok(error);
  }
});

test("public DTO normalizes missing and invalid placeTags defensively", () => {
  const withoutTags = toPublicPlaceDTO({
    _id: "place-1",
    ...createPlaceModelInput(),
  });
  assert.deepEqual(withoutTags.placeTags, []);

  const withRawTags = toPublicPlaceDTO({
    _id: "place-2",
    ...createPlaceModelInput({
      placeTags: [
        "water",
        "bad",
        "hiking",
        "water",
        "viewpoint",
        "food",
        "cafe",
        "bakery",
        "shopping",
      ],
    }),
  });

  assert.deepEqual(
    withRawTags.placeTags,
    ["water", "hiking", "viewpoint", "food", "cafe", "bakery", "shopping"],
  );

  const withLegacyOverflow = toPublicPlaceDTO({
    _id: "place-3",
    ...createPlaceModelInput({
      placeTags: expectedKeys.slice(0, 9),
    }),
  });

  assert.deepEqual(withLegacyOverflow.placeTags, expectedKeys.slice(0, 9));
});

test("adding tags preserves the existing DTO behavior for legacy null timestamps", () => {
  const legacy = { _id: "legacy", createdAt: null, updatedAt: null } as unknown as Parameters<typeof toPublicPlaceDTO>[0];
  const dto = toPublicPlaceDTO(legacy);
  assert.deepEqual(dto.placeTags, []);
  assert.equal(dto.createdAt, null);
  assert.equal(dto.updatedAt, null);
});

test("raw place reads normalize missing and invalid placeTags without losing other fields", () => {
  const normalizedMissing = normalizePlaceReadResult({
    _id: "place-4",
    title: { en: "Raw read" },
    ownerId: "owner-1",
  });

  assert.deepEqual(normalizedMissing.placeTags, []);
  assert.equal(normalizedMissing.ownerId, "owner-1");

  const normalizedInvalid = normalizePlaceReadResult({
    _id: "place-5",
    placeTags: ["water", "__proto__", "hiking", "water"],
    ownerId: "owner-2",
  });

  assert.deepEqual(normalizedInvalid.placeTags, ["water", "hiking"]);
  assert.equal(normalizedInvalid.ownerId, "owner-2");
});
