# Golan Logo Loader Design

## Scope

Add a lightweight route-loading screen that assembles the two supplied Golan logo layers. The change is limited to the shared loader component, its App Router loading boundary, and loader-specific CSS. It does not add text branding, a spinner, progress UI, video, client-side timers, an artificial delay, or unrelated refactoring.

## Routing and ownership

- `app/[lang]/loading.tsx` is the shared loading boundary.
- The proxy internally rewrites clean English URLs to `/en`, while Arabic and Hebrew already use `/ar` and `/he`, so every supported public locale enters the `[lang]` segment.
- Next.js owns the fallback lifecycle and removes the loader as soon as the route content resolves.
- The existing Favorites loading skeleton remains a narrower, route-specific fallback.
- `components/ui/GolanLoader.tsx` contains the only loader markup and image-layer composition.
- `app/globals.css` contains the loader keyframes and reduced-motion overrides, following the repository's existing global animation pattern.

## Authoritative alignment

`public/branding/golan-logo-reference.png` defines a 442 by 564 reference coordinate system. It is used only for development alignment and is not rendered or requested by the final loader.

The two animated source layers remain:

- `public/branding/golan-yellow-symbol.png`
- `public/branding/golan-blue-mountain.png`

Both source files are square 1254 by 1254 RGBA images. Registration against the reference produces these final values:

| Layer | Reference-space size | Reference-space position | CSS width | CSS left | CSS top | Stack order |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Yellow symbol | 530 by 530 | x = -48, y = -28 | 119.909502% | -10.859729% | -4.964539% | front (`z-index: 2`) |
| Blue mountain | 281 by 281 | x = 80, y = 297 | 63.574661% | 18.099548% | 52.659574% | behind (`z-index: 1`) |

The stage uses `aspect-ratio: 442 / 564`. Horizontal positions and widths are relative to the 442-pixel reference width; vertical positions are relative to the 564-pixel reference height. Images retain their square intrinsic ratio and are not stretched or recolored.

The stage width is `clamp(11rem, 20vw, 15.5rem)`. The reference's approximately 400-pixel visible width therefore renders at approximately 159 to 224 pixels, matching the requested mobile and desktop logo sizes while preserving the reference proportions.

## Animation timeline

All motion is CSS keyframes on a four-second infinite loop. Static CSS represents the correctly assembled logo; keyframes temporarily transform that state.

- 0% to 22.5% (0.0 to 0.9 seconds): the yellow symbol moves from `translateY(-18px) scale(0.96) rotateY(4deg)` and opacity 0 to its exact registered position, scale 1, rotation 0, and opacity 1.
- 10% to 35% (0.4 to 1.4 seconds): the blue mountain holds at `translateY(22px) scale(0.94)` and opacity 0 until 10%, then moves upward to its exact registered position, scale 1, and opacity 1 by 35%.
- 35% to 55% (1.4 to 2.2 seconds): the assembled stage settles from scale 1.015 to scale 1 without bounce.
- 55% to 82.5% (2.2 to 3.3 seconds): the complete mark remains clear and performs one smooth float no greater than 2.5 pixels.
- 82.5% to 100% (3.3 to 4.0 seconds): the entire assembled mark fades to opacity 0. It restarts while invisible, creating a clean loop.

The entrance easing is `cubic-bezier(0.22, 1, 0.36, 1)`. No blur, glow, bounce, or spin is introduced.

## Layout, accessibility, and performance

- The loader fills the available viewport with `min-height: 100dvh`, centers the fixed-ratio stage horizontally and vertically, and uses `var(--background)` (`#ffffff`) directly without a card or overlay rectangle.
- The loader exposes `role="status"`, `aria-label="Loading Golan Wiki"`, and an `sr-only` loading message.
- Both `next/image` instances use empty alternative text and are marked decorative.
- Intrinsic image dimensions plus the fixed stage aspect ratio prevent layout shift.
- The component remains a Server Component with no state, effects, timers, remote resources, or animation dependency.
- Under `prefers-reduced-motion: reduce`, every loader animation is disabled and both layers remain fully visible in their registered assembled positions.

## Validation

- Confirm reference alignment with a temporary partial-opacity overlay or screenshot comparison, then remove all debug overlay code.
- Check desktop and mobile viewport sizes.
- Check `/`, `/ar`, and `/he` routes and confirm direction does not alter visual layer ordering or alignment.
- Emulate reduced motion and confirm the static assembled mark is shown.
- Confirm both images are transparent and no checkerboard, card, modal, text, spinner, or percentage is visible.
- Run `npm run lint`.
- Run `npm exec tsc -- --noEmit` because the repository has strict TypeScript but no named type-check script.
- Run `npm run build` as an additional integration check if the local environment permits the configured font and production build requirements.

## Files

- Create `components/ui/GolanLoader.tsx`.
- Create `app/[lang]/loading.tsx`.
- Modify `app/globals.css`.
- Do not modify the reference or source logo assets.
