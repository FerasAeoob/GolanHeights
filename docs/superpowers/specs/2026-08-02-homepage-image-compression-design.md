# Homepage Image Compression Design

**Date:** 2026-08-02

**Status:** Approved direction, pending written-spec review

**Scope:** Lighthouse-flagged homepage hero, category-card, and weekly-partner images

## Purpose

Reduce the download size of the homepage images identified by Lighthouse while preserving useful visual quality and avoiding a site-wide quality regression.

## Existing behavior and root cause

- `AnimatedHero`, `CategoryCard`, and `WeeklyPartnerPopup` use `next/image` without an explicit `quality` value.
- Next.js 16 therefore generates optimizer requests at its default quality of 75.
- `next.config.ts` has no `images.qualities` allowlist, so Next.js 16 implicitly permits only quality 75.
- Some source URLs include Cloudinary `f_auto,q_auto`, but the default Next.js loader still fetches and re-encodes those remote images through `/_next/image` at quality 75.
- The weekly-partner popup also marks its image as priority media even though the homepage hero is the page's intended LCP image.
- Existing `sizes` values are present for all affected `fill` images. The supplied Lighthouse finding attributes the estimated savings to compression rather than missing responsive sizing.

## Selected approach

Use a targeted homepage quality tier:

1. Add quality 60 to the Next.js image-quality allowlist while retaining quality 75 for unaffected images.
2. Set `quality={60}` on the homepage hero, category cards, and weekly-partner popup image.
3. Keep the hero prioritized because it is the intended LCP element.
4. Remove priority loading from the client-mounted weekly-partner popup so it does not compete with the hero for early bandwidth.
5. Keep category cards lazy-loaded through the default `next/image` behavior.
6. Do not change source assets, database records, Cloudinary ownership, upload behavior, or localized content.

## Alternatives considered

### Apply quality 60 globally

This is simpler but could unnecessarily soften place galleries, detail-page media, avatars, and logos. It expands the visual-regression surface beyond the Lighthouse report.

### Replace the Next.js optimizer with a Cloudinary loader

A custom loader could perform width, format, and quality transformations directly at Cloudinary and avoid a second optimization layer. It is not appropriate for this focused fix because the repository also supports non-Cloudinary URLs, and changing the global delivery architecture would require a wider compatibility, caching, and security audit.

## Data and rendering flow

- The existing `next/image` components remain responsible for responsive `srcset` generation.
- The browser continues selecting widths from the current `sizes` hints.
- Flagged images request quality 60 variants through the built-in Next.js optimizer.
- Other images continue using quality 75 unless a separate explicit quality is already present and permitted.
- No new client state, network endpoint, dependency, model, or persisted field is introduced.

## Error and compatibility behavior

- Remote-source validation continues through the existing `remotePatterns` configuration.
- Invalid or unavailable image URLs retain the current `next/image` failure behavior.
- The popup's no-image fallback remains unchanged.
- English, Arabic, and Hebrew layouts and text remain unchanged.
- Existing user changes in metadata routes and `PhotoGallery` are outside scope and must not be modified.

## Verification strategy

1. Add a focused regression check before production edits that verifies the intended quality tier, allowlist, and loading-priority boundary.
2. Run that check before the fix and confirm it fails for the missing behavior.
3. Apply the smallest component and configuration edits needed to pass it.
4. Run the focused check again.
5. Run `npm run lint` and `npm run build`.
6. Inspect the complete diff and confirm only the specification, image configuration, affected homepage components, and focused regression check changed.
7. Confirm generated `next/image` optimizer URLs for the affected components use `q=60`, the hero remains prioritized, and the popup is not prioritized.

## Success criteria

- All Lighthouse-flagged homepage image classes use quality 60.
- Unaffected images retain the existing quality-75 default.
- The hero remains the only prioritized image among the affected homepage media.
- The category-card layout, responsive sizing, alt text, links, overlays, and localization are unchanged.
- Lint and build complete successfully, or any environment-dependent limitation is reported precisely.

## Non-goals

- Replacing or visually editing source images.
- Changing Cloudinary upload, deletion, ownership, or database behavior.
- Globally standardizing every image on the site.
- Redesigning homepage layout or changing copy.
- Introducing a custom image loader or dependency.

## Approval boundary

This specification records the approved targeted direction. Implementation begins only after the user reviews this written specification; the next step is a detailed implementation plan followed by test-driven changes and fresh verification.
