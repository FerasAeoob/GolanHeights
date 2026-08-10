import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const { WHATSAPP_CONTACT } = createRequire(import.meta.url)(
  "../lib/contact.ts",
) as typeof import("../lib/contact");

test("provides a safe outbound WhatsApp contact link", () => {
  assert.deepEqual(WHATSAPP_CONTACT, {
    displayNumber: "052-485-1992",
    href: "https://wa.me/972524851992",
    target: "_blank",
    rel: "noopener noreferrer",
  });
});
