import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import type { ReactElement, ReactNode } from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IPublicPlaceDTO } from "../database/place.model";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
const { default: PlaceCard } = require("../components/places/placecard.tsx") as typeof import("../components/places/placecard");

const place = {
  _id: "test-place",
  title: { en: "Spring", ar: "Spring", he: "Spring" },
  shortDescription: { en: "A spring" },
  slug: { en: "spring", ar: "spring-ar", he: "spring-he" },
  category: "nature",
  images: [],
  openHours: [],
  location: { name: { en: "Golan Heights" } },
} as unknown as IPublicPlaceDTO;
const cardDictionary = { categories: {}, openingHours: {}, places: {}, favorites: {} };

for (const locale of ["en", "ar", "he"] as const) {
  test(`place cards link directly to the final ${locale} URL`, () => {
    const element = PlaceCard({ place, locale, dict: cardDictionary }) as ReactElement<{ href: string }>;
    const expected = locale === "en" ? "/places/spring" : `/${locale}/places/spring-${locale}`;
    assert.equal(element.props.href, expected);
  });
  test(`place cards use the supported English slug fallback for ${locale}`, () => {
    const fallbackPlace = { ...place, slug: { en: "spring" } } as IPublicPlaceDTO;
    const element = PlaceCard({ place: fallbackPlace, locale, dict: cardDictionary }) as ReactElement<{ href: string }>;
    assert.equal(element.props.href, `${locale === "en" ? "" : `/${locale}`}/places/spring`);
  });
}

function hrefs(node: ReactNode): string[] {
  if (Array.isArray(node)) return node.flatMap(hrefs);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const props = (node as ReactElement<{ href?: string; children?: ReactNode }>).props;
  return [...(typeof props.href === "string" ? [props.href] : []), ...hrefs(props.children)];
}

// These children require browser services; this test inspects the hero's own link tree.
const Module = require("node:module") as { _load: (request: string, ...args: unknown[]) => unknown };
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === "next/navigation") return { useRouter: () => ({ push: () => {}, refresh: () => {} }), useSearchParams: () => new URLSearchParams("token=valid") };
  if (request === "@/components/ui/Toast") return { showToast: () => {} };
  if (["./WeatherCard", "./Hero.infocard", "./ScrollToExploreButton", "@/components/animation/Reveal"].includes(request)) {
    return { __esModule: true, default: () => null, Reveal: () => null };
  }
  return originalLoad.call(this, request, ...args);
};
let AnimatedHero: typeof import("../components/homepage/animatedHero").default;
const authForms: Array<{ name: string; component: React.ComponentType<{ lang: "en" | "ar" | "he"; dict: object }>; destinations: string[] }> = [];
try {
  AnimatedHero = require("../components/homepage/animatedHero.tsx").default;
  for (const [name, destinations] of [
    ["Login.Form", ["/forgot-password", "/signup"]],
    ["Signup.Form", ["/terms-of-use", "/privacy-policy", "/login"]],
    ["ForgotPassword.Form", ["/login"]],
    ["ResetPassword.Form", ["/login"]],
    ["ResendVerificationForm", ["/login"]],
  ] as const) {
    authForms.push({ name, component: require(`../components/auth/${name}.tsx`).default, destinations: [...destinations] });
  }
} finally {
  Module._load = originalLoad;
}

for (const { name, component, destinations } of authForms) {
  for (const lang of ["en", "ar", "he"] as const) {
    test(`${name} advertises direct ${lang} navigation destinations`, () => {
      const html = renderToStaticMarkup(createElement(component, { lang, dict: {} }));
      const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]);
      assert.deepEqual(links, destinations.map((destination) => `${lang === "en" ? "" : `/${lang}`}${destination}`));
    });
  }
}

for (const lang of ["en", "ar", "he"] as const) {
  test(`homepage history link uses the final ${lang} URL`, () => {
    const dict = { herocards: {} } as Parameters<typeof AnimatedHero>[0]["dict"];
    assert.deepEqual(hrefs(AnimatedHero({ lang, dict })), [lang === "en" ? "/history" : `/${lang}/history`]);
  });
}
