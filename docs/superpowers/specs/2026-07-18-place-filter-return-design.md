# Place Filter Return Design

## Goal

When a visitor opens a place card from the localized places listing and then selects “Back to Explore” on the detail page, return to the same filtered listing instead of resetting search and filters.

This phase preserves the URL-backed `search`, `category`, `price`, `sort`, and `villages` values. Scroll-position restoration is a separate follow-up and is explicitly out of scope here.

## Chosen Approach

Carry a validated return location from the places listing to the place detail route through a `from` query parameter on listing-card links. The detail page uses that value for “Back to Explore” only when it resolves to the current locale’s places listing; otherwise it uses the normal localized places fallback.

This approach is preferred over always calling `router.back()`, which can send a directly arriving visitor to another site, and over `sessionStorage`, which is client-only and unreliable for copied links or newly opened tabs.

## Components and Ownership

- `lib/navigation/places-return.ts`: owns construction and validation of localized places return URLs. It accepts only the places listing pathname for the active locale and preserves only `search`, `category`, `price`, `sort`, and `villages` query parameters.
- `lib/navigation/places-return.test.ts`: covers clean English routing, Arabic and Hebrew prefixes, supported filter preservation, fallback behavior, and rejection of external or unrelated paths.
- `app/[lang]/(main)/places/page.tsx`: constructs the current filtered listing URL from the already-resolved supported search parameters and passes it to listing card links.
- `components/places/placecard.tsx`: accepts an optional listing return URL. Cards rendered by the places listing add it as the encoded `from` value on the detail link. Existing card callers that do not provide it retain their current navigation behavior.
- `app/[lang]/(main)/places/[slug]/page.tsx`: reads the optional `from` parameter, validates it through the shared helper, and uses the validated URL for “Back to Explore.”

No database, model, API, authentication, authorization, dictionary, or dependency change is required.

## Data Flow

1. The places Server Component reads `search`, `category`, `price`, `sort`, and `villages` from `searchParams`, as it already does.
2. The shared helper builds the localized listing path: `/places` for English, `/ar/places` for Arabic, or `/he/places` for Hebrew, followed by the supported active query parameters.
3. Each card on the places listing links to its localized detail route and includes the encoded listing URL as `from`.
4. The detail Server Component validates `from`. A valid value must be a same-site relative URL whose pathname exactly matches the active locale’s places listing. Unsupported parameters are removed.
5. “Back to Explore” links to the resulting filtered listing URL. Missing, malformed, external, cross-locale, or unrelated values fall back to the active locale’s unfiltered places listing.

The existing URL parameters remain the authoritative filter state. No duplicate client state is introduced.

## Localization and Routing

English listing and detail links must remain clean and must not gain an `/en` prefix. Arabic and Hebrew keep their locale prefixes. Return values cannot switch locale; the active detail-page locale determines the only accepted listing pathname.

No new user-facing text is introduced, so the existing `backtoexplore` dictionary value remains unchanged in all three languages.

## Safety and Failure Behavior

The detail page must never treat `from` as an unrestricted redirect target. Absolute external URLs, protocol-relative URLs, paths outside the current locale’s places listing, cross-locale paths, fragments, and malformed input fall back to the localized places root.

Unknown query keys are discarded. Empty supported values are omitted. A missing optional return value does not affect direct detail-page visits or cards rendered on the homepage, favorites page, or other surfaces.

## Verification

- Add a focused Node test for the pure return-URL helper and run it once before implementation to confirm the expected missing-feature failure.
- Re-run the focused test after implementation and confirm it passes.
- Run `npm run lint`.
- Run `npm run build` if the environment has the required configuration and services; report any environmental limitation exactly.
- In a browser, verify the listing-to-detail-to-“Back to Explore” flow with search alone, each filter type, combined filters, and no filters.
- Check English, Arabic, and Hebrew routes and confirm English has no `/en` prefix.
- Confirm a direct detail visit still returns to the localized unfiltered places page.
- Confirm an invalid or external `from` value cannot control the return destination.

## Out of Scope

- Restoring the previous vertical or horizontal scroll position.
- Changing how search or filter controls update the listing URL.
- Changing filter semantics, place queries, result ordering, or result limits.
- Preserving state when navigating to a place from the homepage, favorites, map, or another non-listing surface.
- Adding persistent local storage, cookies, a database record, or a new testing dependency.
