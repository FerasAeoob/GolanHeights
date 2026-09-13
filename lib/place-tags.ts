import type { ComponentType } from "react";
import type { CategorySlug } from "@/lib/categories";
import {
  Armchair,
  BedDouble,
  Beef,
  Bike,
  Binoculars,
  BriefcaseMedical,
  Candy,
  CarFront,
  Cherry,
  Church,
  Coffee,
  Croissant,
  Dog,
  FerrisWheel,
  Fish,
  Footprints,
  Gem,
  Gift,
  Landmark,
  Pill,
  Printer,
  Sandwich,
  Scissors,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Stethoscope,
  Tent,
  Trees,
  type LucideProps,
  Umbrella,
  Utensils,
  Waves,
  Wine,
} from "lucide-react";

import HorseRidingIcon from "@/components/icons/HorseRidingIcon";

export const MAX_PLACE_TAGS = 8;
export const MAX_PUBLIC_PLACE_TAGS = 5;

export const PLACE_TAG_GROUPS = {
  foodDrink: {
    labelKey: "placeTags.groups.foodDrink",
  },
  nature: {
    labelKey: "placeTags.groups.nature",
  },
  activities: {
    labelKey: "placeTags.groups.activities",
  },
  facilitiesFamily: {
    labelKey: "placeTags.groups.facilitiesFamily",
  },
  health: {
    labelKey: "placeTags.groups.health",
  },
  cultureStay: {
    labelKey: "placeTags.groups.cultureStay",
  },
  shoppingServices: {
    labelKey: "placeTags.groups.shoppingServices",
  },
} as const;

export type PlaceTagGroupKey = keyof typeof PLACE_TAG_GROUPS;

export type PlaceTagDefinition = {
  icon: ComponentType<LucideProps>;
  labelKey: `placeTags.labels.${string}`;
  group: PlaceTagGroupKey;
  applicableCategories: readonly CategorySlug[];
};

export const PLACE_TAGS = {
  food: {
    icon: Utensils,
    labelKey: "placeTags.labels.food",
    group: "foodDrink",
    applicableCategories: ["food-drink"],
  },
  cafe: {
    icon: Coffee,
    labelKey: "placeTags.labels.cafe",
    group: "foodDrink",
    applicableCategories: ["food-drink"],
  },
  bakery: {
    icon: Croissant,
    labelKey: "placeTags.labels.bakery",
    group: "foodDrink",
    applicableCategories: ["food-drink"],
  },
  sweets: {
    icon: Candy,
    labelKey: "placeTags.labels.sweets",
    group: "foodDrink",
    applicableCategories: ["food-drink", "shopping"],
  },
  groceries: {
    icon: ShoppingBasket,
    labelKey: "placeTags.labels.groceries",
    group: "foodDrink",
    applicableCategories: ["food-drink"],
  },
  butcher: {
    icon: Beef,
    labelKey: "placeTags.labels.butcher",
    group: "foodDrink",
    applicableCategories: ["food-drink"],
  },
  fish: {
    icon: Fish,
    labelKey: "placeTags.labels.fish",
    group: "foodDrink",
    applicableCategories: ["food-drink"],
  },
  spices: {
    icon: Sprout,
    labelKey: "placeTags.labels.spices",
    group: "foodDrink",
    applicableCategories: ["food-drink", "shopping"],
  },
  wineSpirits: {
    icon: Wine,
    labelKey: "placeTags.labels.wineSpirits",
    group: "foodDrink",
    applicableCategories: ["food-drink", "shopping"],
  },
  hiking: {
    icon: Footprints,
    labelKey: "placeTags.labels.hiking",
    group: "nature",
    applicableCategories: ["nature", "activities"],
  },
  viewpoint: {
    icon: Binoculars,
    labelKey: "placeTags.labels.viewpoint",
    group: "nature",
    applicableCategories: ["nature", "activities", "holy-places"],
  },
  water: {
    icon: Waves,
    labelKey: "placeTags.labels.water",
    group: "nature",
    applicableCategories: ["nature", "activities"],
  },
  horseRiding: {
    icon: HorseRidingIcon,
    labelKey: "placeTags.labels.horseRiding",
    group: "activities",
    applicableCategories: ["activities"],
  },
  atv: {
    icon: CarFront,
    labelKey: "placeTags.labels.atv",
    group: "activities",
    applicableCategories: ["activities"],
  },
  cycling: {
    icon: Bike,
    labelKey: "placeTags.labels.cycling",
    group: "activities",
    applicableCategories: ["activities", "nature"],
  },
  camping: {
    icon: Tent,
    labelKey: "placeTags.labels.camping",
    group: "activities",
    applicableCategories: ["activities", "nature"],
  },
  cherryPicking: {
    icon: Cherry,
    labelKey: "placeTags.labels.cherryPicking",
    group: "activities",
    applicableCategories: ["activities", "nature"],
  },
  picnic: {
    icon: Sandwich,
    labelKey: "placeTags.labels.picnic",
    group: "facilitiesFamily",
    applicableCategories: ["nature", "activities"],
  },
  shade: {
    icon: Umbrella,
    labelKey: "placeTags.labels.shade",
    group: "facilitiesFamily",
    applicableCategories: ["nature", "activities", "holy-places"],
  },
  playground: {
    icon: FerrisWheel,
    labelKey: "placeTags.labels.playground",
    group: "facilitiesFamily",
    applicableCategories: ["activities", "nature"],
  },
  park: {
    icon: Trees,
    labelKey: "placeTags.labels.park",
    group: "facilitiesFamily",
    applicableCategories: ["activities", "nature"],
  },
  outdoorSeating: {
    icon: Armchair,
    labelKey: "placeTags.labels.outdoorSeating",
    group: "facilitiesFamily",
    applicableCategories: ["food-drink", "stays"],
  },
  pharmacy: {
    icon: Pill,
    labelKey: "placeTags.labels.pharmacy",
    group: "health",
    applicableCategories: ["medical-services"],
  },
  medical: {
    icon: Stethoscope,
    labelKey: "placeTags.labels.medical",
    group: "health",
    applicableCategories: ["medical-services"],
  },
  medicalSupplies: {
    icon: BriefcaseMedical,
    labelKey: "placeTags.labels.medicalSupplies",
    group: "health",
    applicableCategories: ["medical-services"],
  },
  stay: {
    icon: BedDouble,
    labelKey: "placeTags.labels.stay",
    group: "cultureStay",
    applicableCategories: ["stays"],
  },
  holySite: {
    icon: Church,
    labelKey: "placeTags.labels.holySite",
    group: "cultureStay",
    applicableCategories: ["holy-places"],
  },
  history: {
    icon: Landmark,
    labelKey: "placeTags.labels.history",
    group: "cultureStay",
    applicableCategories: ["holy-places", "nature"],
  },
  shopping: {
    icon: ShoppingBag,
    labelKey: "placeTags.labels.shopping",
    group: "shoppingServices",
    applicableCategories: ["shopping", "local-services"],
  },
  gifts: {
    icon: Gift,
    labelKey: "placeTags.labels.gifts",
    group: "shoppingServices",
    applicableCategories: ["shopping", "local-services", "food-drink"],
  },
  jewelry: {
    icon: Gem,
    labelKey: "placeTags.labels.jewelry",
    group: "shoppingServices",
    applicableCategories: ["shopping"],
  },
  fashion: {
    icon: ShoppingBag,
    labelKey: "placeTags.labels.fashion",
    group: "shoppingServices",
    applicableCategories: ["shopping"],
  },
  beauty: {
    icon: Sparkles,
    labelKey: "placeTags.labels.beauty",
    group: "shoppingServices",
    applicableCategories: ["shopping", "medical-services"],
  },
  grooming: {
    icon: Scissors,
    labelKey: "placeTags.labels.grooming",
    group: "shoppingServices",
    applicableCategories: ["local-services"],
  },
  petSupplies: {
    icon: Dog,
    labelKey: "placeTags.labels.petSupplies",
    group: "shoppingServices",
    applicableCategories: ["local-services", "shopping"],
  },
  printing: {
    icon: Printer,
    labelKey: "placeTags.labels.printing",
    group: "shoppingServices",
    applicableCategories: ["local-services", "shopping"],
  },
} as const satisfies Record<string, PlaceTagDefinition>;

export type PlaceTagKey = keyof typeof PLACE_TAGS;

export const PLACE_TAG_KEYS = Object.keys(PLACE_TAGS) as PlaceTagKey[];

export type PlaceTagOption = {
  key: PlaceTagKey;
} & (typeof PLACE_TAGS)[PlaceTagKey];

export function isPlaceTagKey(value: unknown): value is PlaceTagKey {
  return typeof value === "string" && Object.hasOwn(PLACE_TAGS, value);
}

export function isValidPlaceTags(value: unknown): value is PlaceTagKey[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_PLACE_TAGS &&
    value.every((entry) => isPlaceTagKey(entry)) &&
    new Set(value).size === value.length
  );
}

export function normalizePlaceTags(value: unknown): PlaceTagKey[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<PlaceTagKey>();
  const normalized: PlaceTagKey[] = [];

  for (const entry of value) {
    if (!isPlaceTagKey(entry) || seen.has(entry)) {
      continue;
    }

    seen.add(entry);
    normalized.push(entry);
  }

  return normalized;
}

export function getPublicPlaceTags(value: unknown): PlaceTagKey[] {
  return normalizePlaceTags(value).slice(0, MAX_PUBLIC_PLACE_TAGS);
}

export function addPlaceTag(selected: readonly PlaceTagKey[], key: PlaceTagKey): PlaceTagKey[] {
  const normalized = normalizePlaceTags(selected);

  if (normalized.includes(key) || normalized.length >= MAX_PLACE_TAGS) {
    return normalized;
  }

  return [...normalized, key];
}

export function removePlaceTag(selected: readonly PlaceTagKey[], key: PlaceTagKey): PlaceTagKey[] {
  return normalizePlaceTags(selected).filter((selectedKey) => selectedKey !== key);
}

export function movePlaceTag(
  selected: readonly PlaceTagKey[],
  key: PlaceTagKey,
  direction: -1 | 1,
): PlaceTagKey[] {
  const normalized = normalizePlaceTags(selected);
  const currentIndex = normalized.indexOf(key);

  if (currentIndex === -1) {
    return normalized;
  }

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= normalized.length) {
    return normalized;
  }

  const reordered = [...normalized];
  [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
  return reordered;
}

function toPlaceTagOption(key: PlaceTagKey): PlaceTagOption {
  return {
    key,
    ...PLACE_TAGS[key],
  };
}

export function getPlaceTagOptions(
  selected: readonly PlaceTagKey[],
  category?: CategorySlug | null,
): {
  selected: PlaceTagOption[];
  recommended: PlaceTagOption[];
  browseAll: PlaceTagOption[];
} {
  const normalizedSelected = normalizePlaceTags(selected);
  const selectedKeys = new Set(normalizedSelected);
  const availableKeys = PLACE_TAG_KEYS.filter((key) => !selectedKeys.has(key));
  const recommendedKeys = category
    ? availableKeys.filter((key) =>
        PLACE_TAGS[key].applicableCategories.some((candidate) => candidate === category),
      )
    : [];
  const recommendedSet = new Set(recommendedKeys);
  const browseAllKeys = availableKeys.filter((key) => !recommendedSet.has(key));

  return {
    selected: normalizedSelected.map(toPlaceTagOption),
    recommended: recommendedKeys.map(toPlaceTagOption),
    browseAll: browseAllKeys.map(toPlaceTagOption),
  };
}
