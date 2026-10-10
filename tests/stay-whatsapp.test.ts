import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
require("./helpers/load-ts.cjs");
const { normalizeWhatsAppNumber, getStayWhatsAppLink } = require("../lib/stay-whatsapp.ts") as typeof import("../lib/stay-whatsapp");
const { default: StayWhatsAppButton } = require("../components/places/StayWhatsAppButton.tsx") as typeof import("../components/places/StayWhatsAppButton");
const { PlaceContactSchema } = require("../database/place-contact.schema.ts") as typeof import("../database/place-contact.schema");
const { default: PlaceDetails } = require("../components/places/place.sidedetails.tsx") as typeof import("../components/places/place.sidedetails");
const { default: Place } = require("../database/place.model.ts") as typeof import("../database/place.model");

const message = "שלום, הגעתי אליכם דרך אתר Golan Wiki ואשמח לקבל פרטים על זמינות ואפשרויות הזמנה. תודה!";
const labels = {
  en: "Check Availability on WhatsApp",
  he: "בדיקת זמינות בוואטסאפ",
  ar: "الاستفسار عن التوفر عبر واتساب",
};

for (const [locale, label] of Object.entries(labels)) {
  test(`${locale}: renders the exact translated label with the identical Hebrew message`, () => {
    const dictionary = require(`../dictionaries/${locale}.json`);
    const html = renderToStaticMarkup(React.createElement(StayWhatsAppButton, {
      category: "stays", whatsapp: "+972 50-123-4567", label: dictionary.checkAvailabilityWhatsapp,
    }));
    assert.ok(html.includes(label));
    const href = html.match(/href="([^"]+)"/)?.[1];
    assert.equal(href, `https://wa.me/972501234567?text=${encodeURIComponent(message)}`);
    assert.equal(new URL(href!).searchParams.get("text"), message);
  });
}

test("normalizes international formatting without inventing a country code", () => {
  for (const value of ["+972 (50) 123-4567", "00972501234567", "972501234567"]) {
    assert.equal(normalizeWhatsAppNumber(value), "972501234567");
  }
  for (const value of [undefined, "", "0501234567", "123", "+1234567890123456", "972501234567?text=bad", "+972abc501234567"]) {
    assert.equal(normalizeWhatsAppNumber(value), null);
  }
});

test("hides the action for other categories and missing or invalid dedicated numbers", () => {
  for (const [category, whatsapp] of [["nature", "+972501234567"], ["stays", undefined], ["stays", "0501234567"]]) {
    assert.equal(getStayWhatsAppLink(category, whatsapp), null);
    assert.equal(renderToStaticMarkup(React.createElement(StayWhatsAppButton, {
      category, whatsapp, label: labels.en,
    })), "");
  }
});

test("contact validation preserves and normalizes the dedicated number independently of phone", () => {
  assert.deepEqual(PlaceContactSchema.parse({ phone: "0509999999", whatsapp: "+972 50-123-4567" }), {
    phone: "0509999999", whatsapp: "972501234567",
  });
  assert.equal(PlaceContactSchema.safeParse({ whatsapp: "0501234567" }).success, false);
  assert.equal(PlaceContactSchema.safeParse({ whatsapp: "" }).success, true);
  assert.equal(PlaceContactSchema.safeParse({ phone: "0501234567" }).success, true);
});

test("the persistence model keeps the dedicated WhatsApp contact field", () => {
  const place = new Place({ contact: PlaceContactSchema.parse({ whatsapp: "+972501234567" }) });
  assert.equal(place.contact?.whatsapp, "972501234567");
});

for (const locale of Object.keys(labels)) {
  test(`${locale}: both detail layouts retain booking and phone actions and never infer WhatsApp from phone`, () => {
    const props = {
      category: "stays", dict: require(`../dictionaries/${locale}.json`),
      phone: "+972509999999", phoneNumbers: [{ number: "+972508888888", label: "WhatsApp" }],
      bookingLink: "https://example.com/booking", title: "Stay", price: "", mapLink: "",
    };
    const withoutNumber = renderToStaticMarkup(React.createElement(PlaceDetails, props));
    assert.ok(!withoutNumber.includes("https://wa.me/"));
    const html = renderToStaticMarkup(React.createElement(PlaceDetails, { ...props, whatsapp: "+972501234567" }));
    assert.equal((html.match(/href="https:\/\/wa.me\/972501234567\?text=/g) ?? []).length, 2);
    assert.equal((html.match(/href="https:\/\/example.com\/booking"/g) ?? []).length, 2);
    assert.equal((html.match(/href="tel:\+972508888888"/g) ?? []).length, 2);
    assert.ok(!renderToStaticMarkup(React.createElement(PlaceDetails, { ...props, category: "nature", whatsapp: "+972501234567" })).includes("https://wa.me/"));
  });
}
