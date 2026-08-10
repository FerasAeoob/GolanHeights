import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const { FOOTER_SOCIAL_LINKS } = createRequire(import.meta.url)(
  "../lib/social-links.ts",
) as typeof import("../lib/social-links");

test("provides the approved footer social profiles in visual order", () => {
  assert.deepEqual(FOOTER_SOCIAL_LINKS, [
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/golanwiki26",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61592419696533",
    },
    {
      id: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@golanwiki",
    },
  ]);
});
