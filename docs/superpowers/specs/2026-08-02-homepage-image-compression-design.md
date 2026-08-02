# Homepage Image Compression Design

**Date:** 2026-08-02

**Status:** Approved design, pending written-spec review

**Scope:** Lighthouse-flagged homepage hero, category-card, featured-place-card, and weekly-partner images

## Purpose

Reduce the download size of the homepage images identified by Lighthouse while preserving useful visual quality and avoiding a site-wide quality regression.

## Existing behavior and root cause

- `AnimatedHero`, `CategoryCard`, the homepage `PlaceCard` instances, and `WeeklyPartnerPopup` use `next/image` without an explicit `quality` value.
- Next.js 16 therefore generates optimizer requests at its default quality of 75.
- `next.config.ts` has no `images.qualities` allowlist, so Next.js 16 implicitly permits only quality 75.
- Some source URLs include Cloudinary `f_auto,q_auto`, but the default Next.js loader still fetches and re-encodes those remote images through `/_next/image` at quality 75.
- The weekly-partner popup image is the measured LCP element when the popup is shown. Its deprecated `priority` prop emits a preload link in the installed Next.js 16 version but does not add the `fetchpriority="high"` attribute requested by Lighthouse.
- Replacing `priority` with only `fetchPriority="high"` would restore the default lazy-loading behavior, so the popup needs both explicit eager loading and a high fetch priority.
- The hero remains a possible LCP element when the popup is suppressed through its existing client-side storage behavior.
- Existing `sizes` values are present for all affected `fill` images. The supplied Lighthouse finding attributes the estimated savings to compression rather than missing responsive sizing.

## Selected approach

Use a targeted homepage quality tier:

1. Add quality 60 to the Next.js image-quality allowlist while retaining quality 75 for unaffected images.
2. Set `quality={60}` on the homepage hero, category cards, homepage featured place cards, and weekly-partner popup image.
3. Add an optional image-quality prop to `PlaceCard` and pass 60 only from the homepage, preserving the existing quality-75 default for place cards on other routes.
4. Replace the hero's deprecated `priority` prop with `preload` while preserving its existing early-loading behavior.
5. Replace the popup's deprecated `priority` prop with `loading="eager"` and `fetchPriority="high"`. This directly addresses both Lighthouse discovery requirements without preloading a client-conditionally rendered image in the document head.
6. Keep category and featured place cards lazy-loaded through the default `next/image` behavior.
7. Preserve the popup's existing storage suppression, mount timing, entrance delay, and animation behavior.
8. Do not change source assets, database records, Cloudinary ownership, upload behavior, or localized content.

## Alternatives considered

### Apply quality 60 globally

This is simpler but could unnecessarily soften place galleries, detail-page media, avatars, logos, and place cards on routes not covered by the report. It expands the visual-regression surface beyond the Lighthouse finding.

### Apply quality 60 to every `PlaceCard`

All `PlaceCard` images are thumbnail-like media, so this would likely produce useful savings across the site with less plumbing. It is broader than the approved homepage scope, however, and would change listing routes that were not measured in the supplied report.

### Replace the Next.js optimizer with a Cloudinary loader

A custom loader could perform width, format, and quality transformations directly at Cloudinary and avoid a second optimization layer. It is not appropriate for this focused fix because the repository also supports non-Cloudinary URLs, and changing the global delivery architecture would require a wider compatibility, caching, and security audit.

## Data and rendering flow

- The existing `next/image` components remain responsible for responsive `srcset` generation.
- The browser continues selecting widths from the current `sizes` hints.
- Flagged images request quality 60 variants through the built-in Next.js optimizer.
- The homepage opts its featured `PlaceCard` instances into quality 60 through a typed optional prop; other callers retain the component's existing default behavior.
- The hero is preloaded as the likely initial LCP candidate, while the conditionally mounted popup requests its image eagerly with high fetch priority only when it renders.
- Other images continue using quality 75 unless a separate explicit quality is already present and permitted.
- No new client state, network endpoint, dependency, model, or persisted field is introduced.

## Error and compatibility behavior

- Remote-source validation continues through the existing `remotePatterns` configuration.
- Invalid or unavailable image URLs retain the current `next/image` failure behavior.
- The popup's no-image fallback remains unchanged.
- The popup's visibility, delay, transition, dismissal, and storage behavior remain unchanged.
- English, Arabic, and Hebrew layouts and text remain unchanged.
- Existing user changes in metadata routes and `PhotoGallery` are outside scope and must not be modified.

## Verification strategy

1. Add a focused regression check before production edits that verifies the intended quality tier, allowlist, homepage-only `PlaceCard` opt-in, and LCP loading-priority boundary.
2. Run that check before the fix and confirm it fails for the missing behavior.
3. Apply the smallest component and configuration edits needed to pass it.
4. Run the focused check again.
5. Run `npm run lint` and `npm run build`.
6. Inspect the complete diff and confirm only the specification, image configuration, affected homepage components, and focused regression check changed.
7. Render representative `next/image` output and confirm affected optimizer URLs use `q=60`, the hero emits a preload, and the popup image emits `loading="eager"` with `fetchPriority="high"` instead of a preload.

## Success criteria

- All Lighthouse-flagged homepage image classes use quality 60.
- Unaffected images retain the existing quality-75 default.
- Homepage featured place cards use quality 60 without changing `PlaceCard` quality on other routes.
- The hero preserves its preload behavior without the deprecated `priority` prop.
- The popup image is not lazy-loaded and carries high fetch priority when rendered.
- The category-card layout, responsive sizing, alt text, links, overlays, and localization are unchanged.
- Lint and build complete successfully, or any environment-dependent limitation is reported precisely.

## Non-goals

- Replacing or visually editing source images.
- Changing Cloudinary upload, deletion, ownership, or database behavior.
- Globally standardizing every image on the site.
- Redesigning homepage layout or changing copy.
- Introducing a custom image loader or dependency.
- Addressing render-blocking CSS, legacy JavaScript, or unrelated Lighthouse audits.
- Changing the popup's intentional mount delay, entrance animation, or dismissal behavior to reduce its element-render delay.

## Approval boundary

This specification records the approved targeted direction. Implementation begins only after the user reviews this written specification; the next step is a detailed implementation plan followed by test-driven changes and fresh verification.
