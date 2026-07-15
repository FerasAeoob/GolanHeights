# Cherry Picking Orchard Field Guide Design

**Date:** 2026-07-15  
**Status:** Proposed for user review  
**Scope:** Evergreen cherry-picking destination page, regional seasonal status, orchard data administration, and later discovery filters/map  
**Locales:** English, Arabic, Hebrew

## 1. Purpose

Replace the current full-screen, closed-season landing page with an evergreen destination guide that remains useful throughout the year. The page must quickly answer:

- Is the regional cherry-picking season currently open?
- When is the season normally expected?
- Which verified orchards can visitors consider?
- What fruit, reservation, opening, family, and accessibility information is known?
- What should visitors confirm or bring before travelling?
- Which nearby Golan experiences can complete the day?

The selected visual direction is **The Orchard Field Guide**: a premium, photo-led editorial guide that balances local storytelling with practical orchard discovery.

## 2. Goals and success criteria

### Goals

1. Make the route useful during open, expected, closed, and unknown seasonal states.
2. Keep regional seasonal status separate from individual orchard availability.
3. Present only verified operational claims and show when they were last checked.
4. Preserve the existing clean localized URLs and Server Component foundation.
5. Support English, Arabic, and Hebrew without reversing intentional collection order.
6. Add orchard capabilities without changing the meaning of existing Place categories.
7. Keep every new Place field optional so all existing documents remain valid.
8. Introduce complexity in three independently useful phases.

### Success criteria

- The seasonal status and first useful action appear promptly on mobile.
- The page retains crawlable evergreen guide content outside the season.
- A missing or stale status never produces a false “open” claim.
- Existing Place records continue to render and validate without migration.
- Orchard cards omit unknown attributes rather than displaying misleading defaults.
- Users can reach orchard details and directions without relying on a map.
- New user-facing content exists in all three dictionaries with matching shapes.
- Keyboard, touch, RTL, and reduced-motion paths remain usable.

## 3. Non-goals

- Automated weather or crop forecasting.
- Inferring seasonal availability from normal weekly opening hours.
- Scraping orchard websites or social media.
- Real-time inventory, ticketing, or reservation processing.
- Turning `cherry-picking` into a Place's exclusive primary category.
- Adding unsupported fruit calendars, prices, policies, or orchard records.
- Making the map the primary or only orchard discovery interface.

## 4. Existing implementation audit

The current route at `app/[lang]/(main)/cherry-picking/page.tsx` is a localized Server Component. It already provides:

- Clean canonical and hreflang URLs.
- One clear H1.
- A priority `next/image` hero.
- Logical text alignment and visible CTA focus rings.
- Dictionary-backed English, Arabic, and Hebrew content.
- A reduced-motion-aware `Reveal` primitive.

Its limitations are:

- A full `100dvh` hero delays practical content and creates an out-of-season dead end.
- Seasonal state and May 2027 are hardcoded into dictionary copy.
- The primary CTA points to generic Places rather than orchards.
- There are no orchard records, guide sections, freshness information, breadcrumbs, social metadata, or sitemap entries.
- `cherry-picking` is a homepage-only category presentation object, not an allowed persisted Place category.
- The Place model has no orchard-specific metadata or verification fields.

## 5. Design direction

### Visual language

- Warm orchard paper: approximately `#F6F0E5`.
- Deep forest: approximately `#173E32`.
- Ink: approximately `#18201C`.
- Muted leaf: approximately `#6E8067`.
- Cherry red accent: approximately `#8C2432`.
- Golan yellow and blue appear only as small brand or navigation cues.
- Existing Outfit, Heebo, and IBM Plex Sans Arabic fonts remain unchanged.
- Selective 16–20px radii, light borders, restrained shadows, and generous whitespace.

The signature visual device is a thin vertical **orchard-row rule** with numbered section markers. It appears in guide steps and the seasonal timeline without becoming decorative noise.

### Motion

- Reuse restrained opacity/transform reveals, small image zoom, and slight card elevation.
- Critical status and actions must not depend on animation or client JavaScript to become available.
- Add focus-visible parity for hover effects.
- Disable transforms, scaling, and nonessential transitions under reduced motion.
- No GSAP, parallax, floating cherries, or new animation dependency.

## 6. Information architecture

1. **Editorial hero**
   - Evergreen localized H1.
   - Seasonal eyebrow and explicit regional status.
   - Short localized introduction.
   - State-aware primary CTA.
   - Secondary anchor to orchard discovery.

2. **Regional season field note**
   - Regional status.
   - Typical or expected picking window.
   - Last verified date.
   - Weather/crop caveat and source label when provided.

3. **Orchard discovery**
   - Verified orchard results only.
   - Result count and honest empty state.
   - Spacious purpose-built orchard cards.
   - Filters and map are progressively introduced by phase.

4. **How cherry picking works**
   - Choose an orchard.
   - Confirm availability or reservation.
   - Arrive within the confirmed picking window.
   - Follow the orchard's picking and payment policy.

5. **Practical guide**
   - Before leaving.
   - At the orchard.
   - Comfort and access.
   - All copy is cautious where policies vary by orchard.

6. **Verified fruit-season timeline**
   - Shows only fruit or picking experiences supported by verified editorial data.
   - Unknown or unsupported dates are omitted.

7. **Build your Golan day**
   - Internal links to existing relevant categories such as food and drink, nature, activities, shopping, and local services.
   - Uses existing localized category names and paths.

8. **Final CTA**
   - Compact and context-aware.
   - Open season: select an orchard.
   - Other states: explore seasonal or nearby experiences.

## 7. Responsive and directional behavior

### Mobile, below 640px

- Content-led hero with status and primary CTA before or alongside a 44–48dvh image.
- Hero does not use a full-screen minimum height.
- Regional status panel follows immediately.
- Orchard cards use one column, stable 4:3 media, and full-width actions.
- Filters use one minimum-44px trigger that opens an accessible dialog/drawer.
- Active filter chips may scroll horizontally with a visible affordance.
- Map is an explicit optional view after the first results, not permanently visible.
- Guide steps and fruit timeline use vertical orchard-row rails.
- Practical information uses accessible accordions where this improves scanning.

### Tablet, 640–1023px

- Two-column orchard grid when card content remains readable.
- Filters wrap or use a disclosure.
- Map remains optional rather than competing with the list.

### Desktop, 1024px and above

- Asymmetric 5/7 hero split, approximately 620–720px tall beneath the fixed navbar.
- Copy sits on warm paper; orchard photography bleeds toward the viewport edge.
- The regional field note may overlap the hero seam.
- Phase 1–2 use a two-column orchard grid.
- Phase 3 may add a two-column list plus sticky map rail when at least four verified locations exist.
- Practical guidance uses a restrained magazine-style two-column layout.

### RTL and localization

- The page inherits root document direction and locale-specific font.
- Use logical spacing and positioning utilities.
- Text, controls, and directional icons follow locale direction.
- Neutral icons do not mirror.
- Card, gallery, result, and chronological order remains intentional and is not reversed merely because the locale is RTL.
- Dates use locale-aware formatting; do not concatenate translated date fragments.
- Isolate phone numbers, times, prices, and other mixed-direction values when necessary.
- Allow Arabic and Hebrew labels to wrap; avoid fixed-height text containers.

## 8. Seasonal-state model

Regional status and orchard availability represent different facts and must never share one field.

### Regional season status

Store one regional status in the existing singleton Settings document:

```ts
type RegionalCherrySeasonStatus =
  | "unknown"
  | "expected"
  | "open"
  | "closed";

type LocalizedText = {
  en?: string;
  ar?: string;
  he?: string;
};

type CherrySeasonSettings = {
  status: RegionalCherrySeasonStatus;
  expectedStart?: Date | null;
  expectedEnd?: Date | null;
  typicalMonths?: number[];
  note?: LocalizedText;
  sourceLabel?: LocalizedText;
  sourceUrl?: string | null;
  lastVerifiedAt?: Date | null;
};
```

The exact persisted nesting may follow existing Mongoose conventions, but the semantic boundary is fixed.

Rules:

- Missing settings resolve to `unknown`.
- Dates never automatically promote a state to `open`.
- `lastVerifiedAt` means a human or trusted editorial workflow verified the regional claim.
- Missing localized notes fall back using the existing locale policy.
- The public UI never exposes internal user IDs or admin details.
- Metadata remains evergreen and does not include volatile status dates.

### Orchard-level availability

Each orchard may independently report:

```ts
type OrchardAvailabilityStatus =
  | "unknown"
  | "expected"
  | "open"
  | "paused"
  | "sold-out"
  | "closed";
```

This status is optional, belongs to an orchard's cherry-picking offering, and does not alter the regional status. A region may be open while an individual orchard is closed or unverified.

An orchard status without a recent verification timestamp is displayed cautiously. Weekly `openHours` may describe normal hours only after the orchard is known to be seasonally available; they never establish seasonal availability.

## 9. Optional Place data model

All additions are optional and backward-compatible. No existing record requires migration, and the current single `category` field remains unchanged.

Recommended conceptual shape:

```ts
type LocalizedText = {
  en?: string;
  ar?: string;
  he?: string;
};

type SeasonalExperience = {
  type: "cherry-picking";
  availability?: OrchardAvailabilityStatus;
  fruitTypes?: string[];
  reservation?: "unknown" | "not-required" | "recommended" | "required";
  familyFriendly?: boolean;
  accessibilityNote?: LocalizedText;
  openingNote?: LocalizedText;
  pricingNote?: LocalizedText;
  pickingPolicyNote?: LocalizedText;
  expectedStart?: Date | null;
  expectedEnd?: Date | null;
  lastVerifiedAt?: Date | null;
  sourceLabel?: LocalizedText;
  sourceUrl?: string | null;
};

type PlaceExtension = {
  experienceTags?: string[];
  seasonalExperiences?: SeasonalExperience[];
};
```

Design constraints:

- `experienceTags` is non-exclusive and does not replace `category`.
- Fruit values use a controlled allowlist introduced with admin validation.
- Missing values are omitted in cards and filters.
- `false` is a verified negative value; `undefined` means unknown.
- No value is inferred from descriptions, category, weekly hours, or image content.
- Public DTO projections include only public orchard fields and continue excluding `ownerId`.
- New queries require a focused index only after the actual query shape is implemented.

## 10. Orchard card behavior

Each card may render, when verified and available:

- Authentic image and localized alt text.
- Orchard name and localized village/location.
- Orchard-level availability with text and icon, never color alone.
- Fruit types.
- Reservation policy.
- Opening or verification note.
- Family-friendly indicator.
- Accessibility summary.
- Separate Details and Directions actions.

Cards are not wrapped in one interactive link because they contain multiple actions. Unknown facts are omitted rather than replaced with optimistic defaults. When operational information is stale or missing, the card displays a localized “Confirm before travelling” note.

## 11. Data flow and rendering boundaries

### Server-rendered responsibilities

- Load locale dictionary.
- Load regional season settings with a safe unknown fallback.
- Query visible places explicitly tagged for cherry picking.
- Convert records through a public DTO that excludes ownership and sensitive data.
- Render hero, guide content, initial orchard list, metadata, and structured data.

### Client responsibilities

- Phase 1 has no new client filtering requirement.
- Phase 3 owns filter state, accessible mobile filter dialog, result announcements, and list/map view switching.
- Keep client components small; do not move the entire page to the client.
- URL search parameters should represent shareable Phase 3 filters when practical.

### Failure behavior

- Regional settings failure: render `unknown` status and evergreen guide content.
- Orchard query failure: retain the static guide and show a recoverable localized listing message.
- No orchard records: show an honest editorial empty state and relevant internal links.
- No filter matches: preserve selected filters, show Clear filters, and offer all orchards.
- Map failure: list and all actions remain fully usable.

## 12. Admin and authorization design

### Regional status administration

- Add a dedicated cherry-season settings section or page under the existing admin area.
- Server-side authorization must reuse the established admin permission helpers.
- Validate all submitted status, dates, localized notes, and URLs at runtime.
- A successful mutation revalidates all localized cherry-picking routes.
- Admin UI shows saving, success, validation-error, and failure states.

### Orchard administration

- Extend the existing Place create/edit flow with an optional “Seasonal experiences” section.
- Enabling cherry picking reveals its optional fields.
- Existing places with no new fields retain current behavior.
- Server-side create/update schemas enforce enums, date validity, URL validity, and controlled fruit values.
- Never trust client-provided ownership, role, or privilege fields.
- Existing Place authorization and ownership behavior remains unchanged.

The feature does not introduce a new public mutation or cookie-authenticated public endpoint. If implementation changes that assumption, CSRF and distributed abuse protections must be re-audited before proceeding.

## 13. Localization and content strategy

- Replace the small `cherryPickingSeason` dictionary block with a typed, consistently shaped guide namespace in all three dictionaries.
- Localize headings, state labels, CTA variants, caveats, empty/error states, filters, timeline labels, practical guidance, and admin-facing validation feedback where applicable.
- Stable metadata targets the evergreen guide intent rather than a specific year.
- Specific months, dates, prices, varieties, and policies require a verified source.
- Generic guidance must avoid universal claims about food, payment, accessibility, or picking policies.
- Exact translations and editorial claims receive human review before production publication.

## 14. SEO and structured data

- Preserve `/cherry-picking`, `/ar/cherry-picking`, and `/he/cherry-picking` canonicals and reciprocal hreflang.
- Use evergreen localized title and description.
- Add localized Open Graph and Twitter metadata using a verified hero image.
- Add all localized cherry routes to the sitemap with a truthful content update date.
- Render visible localized breadcrumbs.
- Add accurate `WebPage` or `CollectionPage` and `BreadcrumbList` JSON-LD.
- Add `ItemList` only when real orchard cards are rendered.
- Do not add Event structured data without exact verified event dates, location, organizer, state, and offer information.
- Keep the guide content server-rendered and present outside the season.

## 15. Accessibility requirements

- One H1 followed by logical H2 sections.
- Explicit, semantic status text; do not rely on red or green alone.
- Real links and buttons with visible focus.
- Minimum approximate 44×44px touch targets.
- Descriptive image alt text based only on verified visible facts.
- Filter controls use native checkbox/radio semantics where possible.
- Mobile filter dialog supports an accessible name, focus containment, Escape, focus restoration, and safe body-scroll restoration.
- Result count changes are announced with polite live-region behavior after user interaction.
- Accordions expose `aria-expanded` and preserve keyboard operation.
- The map is supplementary and does not interrupt access to list actions.
- Motion respects reduced-motion settings.

## 16. Three-phase delivery

### Phase 1: Core evergreen page

Deliver a complete useful page without requiring orchard schema changes.

Includes:

- Orchard Field Guide hero and visual system.
- Safe regional status presentation using existing dictionary content initially, with an explicit `unknown` fallback boundary ready for Phase 2.
- How-it-works, practical guidance, verified timeline content if available, nearby experiences, and final CTA.
- Honest orchard empty/coming-soon state; no fake orchard records.
- Evergreen metadata, social metadata, breadcrumbs, sitemap entries, and safe page-level structured data.
- Full localization, RTL, accessibility, responsive, and reduced-motion behavior.

Phase 1 must not claim automatic or admin-managed live status before Phase 2 exists.

### Phase 2: Orchard data and admin support

Deliver real editorial control and verified orchard listings.

Includes:

- Separate regional cherry-season settings and admin interface.
- Optional, backward-compatible Place experience fields.
- Runtime validation for settings and Place extensions.
- Place admin create/edit support for cherry-picking metadata.
- Public DTO/query support and purpose-built orchard cards.
- Verified timestamps, source handling, safe fallbacks, and cache/path revalidation.
- Orchard-level status remains independent from regional status.

Phase 2 may display a simple unfiltered orchard list. It does not require a map or advanced filters.

### Phase 3: Advanced filters and map

Deliver enhanced discovery after sufficient verified data exists.

Includes:

- Filters for village, fruit type, current verified availability, reservation policy, and family suitability only where data completeness justifies them.
- Accessible mobile filter dialog and desktop filter rail.
- Shareable filter state where practical.
- Result counts, active-filter chips, clear-all recovery, and zero-result handling.
- Optional list/map toggle and desktop sticky map rail.
- Map appears only when enough geocoded verified orchards exist to add value.
- Performance and accessibility validation for list/map synchronization.

Phase 3 must degrade to the complete list experience if JavaScript or the map fails.

## 17. Phase gates

Each phase requires separate verification before the next begins.

- **Phase 1 gate:** evergreen content, metadata, localized responsive layout, and honest no-orchard behavior are complete.
- **Phase 2 gate:** admins can manage regional status and optional orchard data; existing Place records remain valid; public listings show only verified fields.
- **Phase 3 gate:** there is enough complete orchard data to make each enabled filter and the map useful rather than decorative.

Skipping a gate requires explicit user approval.

## 18. Verification strategy

The repository currently has no verified automated test command. Implementation should use focused tests where a test setup is deliberately introduced, plus the repository's existing commands and browser verification.

Required verification by phase:

- Run `npm run lint` for affected code.
- Run `npm run build` when environment and configured services allow it.
- Validate dictionary JSON and matching guide namespace shapes.
- Exercise English, Arabic, and Hebrew routes.
- Check narrow mobile, common mobile, tablet, and desktop viewports.
- Verify keyboard focus, filter/dialog behavior, headings, links, and reduced motion.
- Check browser console errors.
- Verify safe unknown, expected, open, and closed regional states.
- Verify independent orchard states, missing optional fields, stale verification, no records, query failure, and zero filter results.
- Confirm existing non-orchard Place records still create, update, render, and serialize correctly.
- Confirm orchard routes remain usable when map scripts fail.

No command may be reported as passing unless it was actually run successfully.

## 19. Risks and mitigations

- **Unsupported operational claims:** require explicit values, source, and verification time; default to unknown.
- **Status conflation:** keep regional settings and orchard offering status in separate types, storage paths, and UI labels.
- **Backward compatibility:** all Place additions are optional; preserve category and existing DTO behavior.
- **Sparse initial data:** phase the filters/map and use an honest empty state.
- **Stale data:** display freshness, encourage direct confirmation, and avoid sorting by open status when freshness is unreliable.
- **RTL regressions:** keep collection order intentional and verify all three locales.
- **Long translations:** use content-sized controls and flexible card metadata.
- **Map dependency:** preserve complete list discovery and actions without the map.
- **Nested interactions:** use card containers with separate links/buttons rather than a whole-card link.
- **Image quality and rights:** require authentic, rights-cleared images with localized alt text.
- **Admin security:** enforce admin authorization and runtime validation server-side.
- **Cache staleness:** revalidate localized cherry routes and relevant place caches after approved changes.

## 20. Approval boundary

This document defines the design only. No application implementation begins until the user approves this written specification. After approval, the next step is a detailed implementation plan organized around the three phases, followed by test-driven implementation and verification-before-completion.
