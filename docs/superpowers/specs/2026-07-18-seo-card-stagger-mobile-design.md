# SEO Card Stagger and Mobile Layout Design

## Goal

Make the homepage Golan Wiki section feel lighter and more polished by revealing its content progressively and tightening the phone layout, without changing its copy, routes, or desktop information hierarchy.

## Current behavior

`app/[lang]/(main)/page.tsx` wraps the complete `SeoTextSection` in one `Reveal`. The heading and all five cards therefore enter as one large block. On narrow screens, the existing gaps, padding, heading size, and bottom spacing make the single-column section feel unnecessarily heavy.

## Approved interaction

- Reveal the section header once when it enters the viewport.
- Reveal every card through its own existing `Reveal` wrapper.
- Use a 600ms, 16px fade-and-rise for the header and a 650ms, 20px fade-and-rise for the cards.
- Stagger the five cards by 80ms per DOM position, producing delays of 0ms through 320ms when they enter together on desktop.
- Keep `once` behavior so content does not replay while scrolling back and forth.
- Reuse the existing reduced-motion behavior in `Reveal` and `app/globals.css`; do not add another observer or animation system.
- Use vertical motion only so the animation is direction-neutral in English, Arabic, and Hebrew.

## Responsive layout

- Preserve one column below the existing `md` breakpoint, two columns from `md`, and the final card spanning both desktop columns.
- On phones, use a 16px grid gap, 20px card padding, a 24px section title, 16px intro text, and 56px bottom spacing.
- Restore the existing roomier spacing progressively at `sm` and `md` sizes.
- Keep readable body text and the existing card surfaces, rings, radii, and hover treatment.
- Preserve the inherited page direction. DOM order remains unchanged, so Arabic and Hebrew continue to start the desktop grid from the right naturally.

## Implementation boundaries

- Remove only the outer `Reveal` around `SeoTextSection` in the homepage caller.
- Import and reuse `Reveal` inside `components/homepage/SeoTextSection.tsx` for the header and card wrappers.
- Keep `md:col-span-2` on the fifth card's reveal wrapper so it remains a full-width grid item.
- Do not change dictionary keys or localized copy.
- Do not add dependencies, global animation styles, or unrelated refactors.

## Verification

- Run `npm run lint` and `npm run build`.
- Exercise the homepage at phone and desktop widths.
- Check English, Arabic, and Hebrew for card order, alignment, spacing, overflow, and animation behavior.
- Check a reduced-motion browser setting to confirm content appears without the staggered transform.
- Inspect the browser console for errors.

The repository has no verified automated test command, so this presentational change will use the existing lint/build checks and browser verification instead of adding new test infrastructure.
