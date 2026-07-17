# Places Page About-Style Design

## Goal

Bring the visual language of the localized `/about` page to the localized `/places` page while preserving all existing places data, search, filtering, favorites, map, metadata, and routing behavior.

## Chosen Approach

Restyle the `/places` page shell and the existing interactive surfaces in place. This provides a cohesive result without extracting shared presentation components or restructuring the places feature.

## Page Structure

1. Wrap the page in a localized, direction-aware white page shell.
2. Replace the solid emerald places banner with the `/about`-style zinc hero: dark background, restrained emerald glow, centered eyebrow/title treatment, localized description, and matching responsive spacing.
3. Position the existing search, category, price, and village controls in a prominent rounded white panel that visually bridges the hero and the results content.
4. Keep the existing results grid and data order, but align its spacing and card surfaces with the rounded, bordered, lightly shadowed `/about` cards.
5. Present the existing map in a matching rounded section with consistent content width and bottom spacing.

## Components and Ownership

- `app/[lang]/(main)/places/page.tsx`: owns the page shell, hero, main section spacing, filter panel, results layout, empty state, and map section.
- `components/search.tsx`: retains its URL-backed debounced search behavior; only visual classes may change.
- `components/filter.dropdown.tsx`: retains its query-parameter and selection behavior; only visual classes and accessible focus presentation may change.
- `components/village.filter.tsx`: retains single-village URL selection and horizontal overflow behavior; visual changes stay within the established emerald/slate design language.
- `components/places/placecard.tsx`: retains its DTO, localization, favorite, status, rating, and link behavior; surface styling may be aligned with `/about` without changing its content model.
- `components/places/PlacesMapDynamic.tsx` and map clients: retain loading and map behavior; only their containing presentation may change unless a minimal loading-surface class adjustment is required for visual consistency.

No new dependency, route, database query, API, model, or client state is introduced.

## Data and Interaction Behavior

The Server Component continues to load the dictionary, authenticated user, MongoDB places, filters, and sort state exactly as it does now. Existing URL parameters (`search`, `category`, `price`, `sort`, and `villages`) remain authoritative. The result limit, DTO conversion, favorite calculation, and map payload remain unchanged.

Search debounce, dropdown selection, village selection, favorite actions, place navigation, and map interactions must behave as before. Styling must not cover controls, reorder results, or create new client-side effects.

## Localization and Direction

Existing dictionary values provide all visible copy, so no new translation keys are required. English keeps clean public URLs; Arabic and Hebrew retain locale-prefixed URLs. The page and text controls respect the active locale direction, while the visual result grid keeps its current stable collection order.

Logical spacing and positioning utilities are preferred where direction matters. The design must avoid clipping or reversed control order in Arabic and Hebrew.

## Responsive and Accessibility Requirements

- Mobile-first layout with no horizontal page overflow.
- Search and filters stack on narrow screens and remain comfortably tappable.
- Existing horizontal village scrolling remains usable.
- Visible keyboard focus is preserved or improved for inputs, dropdowns, chips, cards, and favorite controls.
- Decorative glow elements remain hidden from assistive technology.
- Hover motion remains restrained and does not introduce a new animation system.
- Cards and map keep stable dimensions while media or dynamic code loads.

## Empty, Loading, and Error States

The existing localized empty-results message remains in place and receives a design-consistent container. Existing map loading fallbacks remain functional and visually consistent. Database and rendering error handling remain under the existing route and application boundaries; this styling task does not change error semantics.

## Verification

- Review the complete diff for behavioral or unrelated changes.
- Run `npm run lint`.
- Run `npm run build` if the environment has the required configuration and services; report any environmental limitation exactly.
- Exercise `/places`, `/ar/places`, and `/he/places` in a browser at mobile and desktop widths.
- Verify search, category, price, village selection, empty results, place-card navigation, favorite control presentation, map loading/rendering, keyboard focus, console errors, and horizontal overflow.
- The repository has no verified automated UI test command. Browser verification will be used instead of adding an unrelated test framework.

## Out of Scope

- Changing place queries, sorting, filtering semantics, DTOs, models, authentication, favorite mutations, map logic, or metadata.
- Redesigning `/about` or other public pages.
- Introducing new marketing copy, feature pills, calls to action, dependencies, or shared design-system abstractions.
