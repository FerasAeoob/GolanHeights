import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const {
  buildPlacePhoneContact,
  getEffectivePhoneNumbers,
  normalizePhoneNumbers,
} = createRequire(import.meta.url)("../lib/place-phone-numbers.ts") as typeof import("../lib/place-phone-numbers");
const { PlaceContactSchema } = createRequire(import.meta.url)(
  "../database/place-contact.schema.ts",
) as typeof import("../database/place-contact.schema");

test("trims phone entries and removes blank rows and labels", () => {
  assert.deepEqual(
    normalizePhoneNumbers([
      { number: " 04-1234567 ", label: " Main " },
      { number: "   ", label: "Ignored" },
      { number: "050-1234567", label: " " },
    ]),
    [
      { number: "04-1234567", label: "Main" },
      { number: "050-1234567" },
    ],
  );
});

test("prefers modern phone numbers over the legacy phone", () => {
  assert.deepEqual(
    getEffectivePhoneNumbers(
      [{ number: "04-1234567", label: "Main" }],
      "050-9999999",
    ),
    [{ number: "04-1234567", label: "Main" }],
  );
});

test("falls back to a trimmed legacy phone", () => {
  assert.deepEqual(getEffectivePhoneNumbers([], " 050-9999999 "), [
    { number: "050-9999999" },
  ]);
});

test("returns no phone entries when both representations are blank", () => {
  assert.deepEqual(getEffectivePhoneNumbers(undefined, "  "), []);
});

test("builds a normalized dual-write contact payload without losing other fields", () => {
  assert.deepEqual(
    buildPlacePhoneContact({
      website: "https://example.com",
      phoneNumbers: [
        { number: " 04-1234567 ", label: " Reservations " },
        { number: " ", label: "Ignored" },
      ],
    }),
    {
      website: "https://example.com",
      phoneNumbers: [{ number: "04-1234567", label: "Reservations" }],
      phone: "04-1234567",
    },
  );
});

test("validates labeled phone numbers and mirrors the first into legacy phone", () => {
  const result = PlaceContactSchema.safeParse({
    phone: "old-number",
    phoneNumbers: [
      { number: " 04-1234567 ", label: " Main " },
      { number: "050-1234567", label: " " },
    ],
  });

  assert.equal(result.success, true);
  if (!result.success) return;

  assert.deepEqual(result.data.phoneNumbers, [
    { number: "04-1234567", label: "Main" },
    { number: "050-1234567" },
  ]);
  assert.equal(result.data.phone, "04-1234567");
});

test("preserves a legacy-only contact payload", () => {
  const result = PlaceContactSchema.safeParse({ phone: " 04-7654321 " });

  assert.equal(result.success, true);
  if (!result.success) return;

  assert.equal(result.data.phone, "04-7654321");
  assert.equal(result.data.phoneNumbers, undefined);
});

test("clears the legacy phone when an empty modern list is submitted", () => {
  const result = PlaceContactSchema.safeParse({
    phone: "04-7654321",
    phoneNumbers: [],
  });

  assert.equal(result.success, true);
  if (!result.success) return;

  assert.deepEqual(result.data.phoneNumbers, []);
  assert.equal(result.data.phone, "");
});

test("rejects a modern phone entry without a number", () => {
  const result = PlaceContactSchema.safeParse({
    phoneNumbers: [{ number: " ", label: "Main" }],
  });

  assert.equal(result.success, false);
});
