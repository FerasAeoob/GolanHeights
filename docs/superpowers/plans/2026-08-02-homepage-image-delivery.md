# Homepage Image Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the Lighthouse-flagged homepage image downloads with a targeted quality-60 tier and correct the hero/popup LCP loading semantics without changing unrelated images or popup behavior.

**Architecture:** Keep the built-in Next.js image optimizer and allow only qualities 60 and 75. Apply quality 60 directly to the hero, categories, and popup, and expose a typed optional `imageQuality` input on `PlaceCard` so only the homepage opts featured cards into quality 60. Protect the boundary with one focused Node regression test, representative server-render assertions, and matched browser screenshots.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, `next/image`, Node's built-in test runner, Playwright CLI, npm.

## Global Constraints

- Preserve quality 75 for unaffected images and non-homepage `PlaceCard` callers.
- Preserve every existing image source, `sizes` value, alt string, stable wrapper, layout, route, and localization behavior.
- Preserve the popup's storage suppression, mount delay, entrance animation, and dismissal behavior.
- Do not change Cloudinary uploads, source records, ownership, database behavior, render-blocking CSS, or legacy JavaScript.
- Do not add dependencies or a custom image loader.
- Do not modify unrelated files or existing user changes.
- Run only commands actually supported by `package.json`; the focused test uses `node --test` because no repository test script exists.

## File Structure

- Create `tests/homepage-image-delivery.test.mjs`: source-boundary and representative runtime-output regression checks.
- Modify `next.config.ts`: allow optimizer qualities 60 and 75.
- Modify `components/homepage/animatedHero.tsx`: quality 60 and `preload` for the hero.
- Modify `components/categorycard.tsx`: quality 60 for category cards.
- Modify `components/places/placecard.tsx`: typed optional `imageQuality` prop forwarded to `next/image`.
- Modify `app/[lang]/(main)/page.tsx`: pass `imageQuality={60}` only to homepage `PlaceCard` instances.
- Modify `components/WeeklyPartnerPopup.tsx`: quality 60, eager loading, and high fetch priority without preload/priority.
- Create verification artifacts under `output/playwright/homepage-image-delivery/`: matched baseline and post-change screenshots; do not commit generated screenshots unless explicitly requested.

---

### Task 1: Add the failing regression boundary and capture visual baselines

**Files:**
- Create: `tests/homepage-image-delivery.test.mjs`
- Create (untracked artifacts): `output/playwright/homepage-image-delivery/baseline-mobile.png`
- Create (untracked artifacts): `output/playwright/homepage-image-delivery/baseline-desktop.png`

**Interfaces:**
- Consumes: existing `next.config.ts`, homepage/component source, React, `react-dom/server`, and `next/image`.
- Produces: a single `node --test tests/homepage-image-delivery.test.mjs` regression command and matched baseline screenshots.

- [ ] **Step 1: Capture the unchanged baseline at fixed viewports**

Start the current application without production edits. Use Playwright at 390×844 and 1440×1000, clear `weekly_partner_popup_hidden_until`, wait for the popup and images to settle, and save full-page screenshots as:

```text
output/playwright/homepage-image-delivery/baseline-mobile.png
output/playwright/homepage-image-delivery/baseline-desktop.png
```

Record the route, viewport, device scale, popup state, and any data/environment limitation so the post-change capture can match them exactly.

- [ ] **Step 2: Write the focused regression test**

Create `tests/homepage-image-delivery.test.mjs` with Node's built-in test runner. The test must:

```js
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import NextImage from "next/image";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

function collectTsxFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectTsxFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".tsx") ? [absolutePath] : [];
  });
}

function imageElement(source) {
  const match = source.match(/<Image\b[\s\S]*?\/>/);
  assert.ok(match, "expected a next/image element");
  return match[0];
}

test("targeted homepage sources declare the quality and loading boundary", () => {
  const config = read("next.config.ts");
  const qualities = config.match(/qualities\s*:\s*\[([^\]]+)\]/);
  assert.ok(qualities, "images.qualities must be configured");
  assert.deepEqual(
    qualities[1].match(/\d+/g)?.map(Number).sort((a, b) => a - b),
    [60, 75],
  );

  const heroImage = imageElement(read("components/homepage/animatedHero.tsx"));
  assert.match(heroImage, /quality=\{60\}/);
  assert.match(heroImage, /\bpreload\b/);
  assert.doesNotMatch(heroImage, /\bpriority\b/);

  const categoryImage = imageElement(read("components/categorycard.tsx"));
  assert.match(categoryImage, /quality=\{60\}/);

  const popupImage = imageElement(read("components/WeeklyPartnerPopup.tsx"));
  assert.match(popupImage, /quality=\{60\}/);
  assert.match(popupImage, /loading="eager"/);
  assert.match(popupImage, /fetchPriority="high"/);
  assert.doesNotMatch(popupImage, /\bpriority\b/);
  assert.doesNotMatch(popupImage, /\bpreload\b/);

  const placeCard = read("components/places/placecard.tsx");
  assert.match(placeCard, /imageQuality\?:\s*60\s*\|\s*75/);
  assert.match(imageElement(placeCard), /quality=\{imageQuality\}/);

  const callers = collectTsxFiles(path.join(root, "app"))
    .filter((file) => readFileSync(file, "utf8").includes("<PlaceCard"));
  const optedInCallers = callers.filter((file) =>
    readFileSync(file, "utf8").includes("imageQuality={60}"),
  );
  assert.deepEqual(
    optedInCallers.map((file) => path.relative(root, file).replaceAll("\\", "/")),
    ["app/[lang]/(main)/page.tsx"],
  );
});

test("representative Next Image runtime output preserves the quality boundary", () => {
  const renderImage = (props) =>
    renderToStaticMarkup(
      React.createElement(NextImage, {
        src: "/placeholder.jpg",
        alt: "Representative image",
        width: 640,
        height: 400,
        ...props,
      }),
    );

  const targeted = renderImage({ quality: 60 });
  assert.match(targeted, /(?:src|srcSet)="[^"]*q=60/);

  const unaffected = renderImage({});
  assert.match(unaffected, /(?:src|srcSet)="[^"]*q=75/);

  const hero = renderImage({ quality: 60, preload: true });
  assert.match(hero, /<link rel="preload" as="image"/);

  const popup = renderImage({
    quality: 60,
    loading: "eager",
    fetchPriority: "high",
  });
  assert.match(popup, /<img[^>]*fetchPriority="high"[^>]*loading="eager"/);
  assert.doesNotMatch(popup, /<link rel="preload" as="image"/);
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
node --test tests/homepage-image-delivery.test.mjs
```

Expected: the source-boundary test fails because `images.qualities`, explicit quality 60, the typed `PlaceCard` prop, and the new loading props do not exist. The runtime-output test may already pass because it verifies installed framework semantics; record both test results and confirm the failing assertion represents missing production behavior.

- [ ] **Step 4: Commit only the failing test**

```powershell
git add -- tests/homepage-image-delivery.test.mjs
git commit -m "test: cover homepage image delivery"
```

---

### Task 2: Implement the targeted quality and loading behavior

**Files:**
- Modify: `next.config.ts`
- Modify: `components/homepage/animatedHero.tsx`
- Modify: `components/categorycard.tsx`
- Modify: `components/places/placecard.tsx`
- Modify: `app/[lang]/(main)/page.tsx`
- Modify: `components/WeeklyPartnerPopup.tsx`
- Test: `tests/homepage-image-delivery.test.mjs`

**Interfaces:**
- Consumes: the regression boundary from Task 1.
- Produces: `PlaceCardProps.imageQuality?: 60 | 75`, targeted quality-60 optimizer requests, hero preload behavior, and popup eager/high-priority behavior.

- [ ] **Step 1: Permit only the required optimizer qualities**

Add the allowlist inside the existing `images` object in `next.config.ts`:

```ts
images: {
    qualities: [60, 75],
    remotePatterns: [
```

- [ ] **Step 2: Apply quality 60 and current hero preload semantics**

In `components/homepage/animatedHero.tsx`, preserve `fill`, `sizes="100vw"`, and the existing source/alt/classes, then replace `priority` with:

```tsx
quality={60}
preload
```

- [ ] **Step 3: Apply quality 60 to category cards**

In `components/categorycard.tsx`, preserve the existing source, alt, fill, sizes, and classes, and add:

```tsx
quality={60}
```

- [ ] **Step 4: Add the typed optional PlaceCard quality input**

Extend `PlaceCardProps` in `components/places/placecard.tsx`:

```ts
imageQuality?: 60 | 75;
```

Destructure it without a default so non-homepage callers continue to omit `quality` and use Next.js quality 75:

```ts
imageQuality,
```

Forward it to the existing image without changing any other prop:

```tsx
quality={imageQuality}
```

- [ ] **Step 5: Opt in only homepage featured cards**

In `app/[lang]/(main)/page.tsx`, add this prop to the existing homepage `PlaceCard` call:

```tsx
imageQuality={60}
```

Do not modify the callers in `app/[lang]/(main)/favorites/page.tsx` or `app/[lang]/(main)/places/page.tsx`.

- [ ] **Step 6: Correct popup quality and request priority**

In `components/WeeklyPartnerPopup.tsx`, preserve the source, alt, fill, sizes, class, condition, and fallback. Replace `priority` with:

```tsx
quality={60}
loading="eager"
fetchPriority="high"
```

Do not add `preload` and do not change popup timing or animation.

- [ ] **Step 7: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/homepage-image-delivery.test.mjs
```

Expected: two tests pass with zero failures.

- [ ] **Step 8: Review and commit the implementation**

Inspect `git diff --check`, the complete scoped diff, and `git status --short`, then commit only the six production files:

```powershell
git add -- next.config.ts components/homepage/animatedHero.tsx components/categorycard.tsx components/places/placecard.tsx 'app/[lang]/(main)/page.tsx' components/WeeklyPartnerPopup.tsx
git commit -m "perf: optimize homepage image delivery"
```

---

### Task 3: Verify runtime output, visual quality, lint, and build

**Files:**
- Verify: `tests/homepage-image-delivery.test.mjs`
- Create (untracked artifacts): `output/playwright/homepage-image-delivery/quality-60-mobile.png`
- Create (untracked artifacts): `output/playwright/homepage-image-delivery/quality-60-desktop.png`

**Interfaces:**
- Consumes: Task 2's implementation and Task 1's fixed baseline conditions.
- Produces: fresh automated, runtime, browser, visual, lint, and build evidence.

- [ ] **Step 1: Run the focused regression check fresh**

```powershell
node --test tests/homepage-image-delivery.test.mjs
```

Expected: two tests pass. Confirm output covers targeted `q=60`, unaffected `q=75`, hero preload, popup eager/high fetch priority, and no popup preload.

- [ ] **Step 2: Build the production application**

```powershell
npm run build
```

Expected: exit code 0. If environment data or network access blocks the build, report the exact failure and do not claim a successful build.

- [ ] **Step 3: Verify actual browser markup and optimizer URLs**

Run the production server and inspect the same homepage route with Playwright. Confirm:

```text
hero preload href/srcset -> q=60
hero img src/srcset -> q=60
category img src/srcset -> q=60
homepage featured PlaceCard img src/srcset -> q=60
popup img src/srcset -> q=60
popup img loading -> eager
popup img fetchpriority -> high
popup image preload count -> 0
representative unaffected next/image src/srcset -> q=75
```

Use an unaffected image from another route or component that does not pass a quality prop. Record selectors/alt text and the inspected URLs so the result is reproducible.

- [ ] **Step 4: Capture matched quality-60 screenshots**

At the exact route, content, viewport dimensions, device scale, popup state, and wait conditions recorded in Task 1, save:

```text
output/playwright/homepage-image-delivery/quality-60-mobile.png
output/playwright/homepage-image-delivery/quality-60-desktop.png
```

- [ ] **Step 5: Compare baseline and quality-60 screenshots**

Compare mobile baseline to mobile quality 60, and desktop baseline to desktop quality 60. Inspect hero gradients/sky, foliage/terrain texture, category-card edges and fine detail, the featured place card, and the popup promotional image for unacceptable softness, banding, or important-detail loss. If quality loss is unacceptable, stop and report the evidence before changing the approved quality tier.

- [ ] **Step 6: Run lint**

```powershell
npm run lint
```

Expected: exit code 0 with no lint errors.

- [ ] **Step 7: Perform the final diff and repository-state audit**

Run:

```powershell
git diff --check
git status --short
git log -3 --oneline
```

Confirm generated screenshots remain untracked/ignored, no unrelated file was modified, and every success claim is backed by the fresh command/browser evidence above.
