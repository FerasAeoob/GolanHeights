# Mobile Gallery Direction Design

## Goal

Keep the place photo gallery's mobile image order and horizontal scroll direction identical in English, Arabic, and Hebrew.

## Design

The mobile scrolling strip in `components/places/PhotoGallery.tsx` will explicitly use `dir="ltr"`, matching the desktop gallery's existing locale-independent visual ordering. This override applies only to the media collection; it does not change the direction of the page or any localized text.

Because the strip will always be LTR, its edge-fade state will use one LTR scroll-position calculation. The fade overlays remain physically attached to the left and right edges of this locale-invariant collection instead of inheriting logical RTL placement.

## Behavior

- The first image remains on the left in every locale.
- Swiping left reveals later images in every locale.
- Image order remains the order supplied through the `images` prop.
- Desktop gallery behavior remains unchanged.
- English, Arabic, and Hebrew page text and surrounding layout retain their existing direction.

## Validation

- Establish a failing browser-level or DOM-level regression check showing that the mobile scroll container does not currently resolve to LTR in an RTL page.
- Verify the same mobile strip direction and initial image position under LTR and RTL ancestors after the change.
- Run the repository lint command and production build.
- If browser tooling is available, exercise a place with at least three images at a mobile viewport in English, Arabic, and Hebrew.
