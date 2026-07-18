# Place Filter Return Design

## Goal

When a visitor opens a place card from the localized places listing and selects “Back to Explore,” use the same browser-history behavior that already works with the mouse back button. This keeps the existing URL-backed search and filters instead of returning to a fresh `/places` URL.

This phase verifies filter preservation only. Explicit scroll-position handling remains a separate follow-up.

## Chosen Approach

Replace the detail page’s static places link with a small client back control. The control calls Next.js `router.back()` when the current tab has history, allowing the browser to return to the exact filtered listing URL already in its history. If the detail page has no previous history entry, it navigates to the normal localized places fallback.

This deliberately reuses the behavior the user confirmed is already working. It does not add return parameters, storage, cookies, or a new navigation framework.

## Components and Ownership

- `components/places/BackToExplore.tsx`: renders the existing localized label and arrow, calls `router.back()`, and accepts the localized fallback URL.
- `app/[lang]/(main)/places/[slug]/page.tsx`: replaces the static “Back to Explore” `Link` with the focused client control and passes `/places`, `/ar/places`, or `/he/places` as the fallback.

No listing-page, place-card, filter, database, model, API, authentication, dictionary, or dependency change is required.

## Data Flow

1. Search and filters continue to live in the places listing URL.
2. Opening a card creates the existing browser-history entry for the detail page.
3. Selecting “Back to Explore” calls `router.back()` and returns to the exact previous listing URL, including `search`, `category`, `price`, `sort`, and `villages` when present.
4. A detail page opened without a previous history entry uses the active locale’s unfiltered places route as a safe fallback.

## Localization and Accessibility

English uses `/places`; Arabic uses `/ar/places`; Hebrew uses `/he/places`. The control continues to use the existing `backtoexplore` dictionary value and rotates the arrow for Arabic and Hebrew as the current UI does.

The control remains a semantic button because it performs a history action. It retains visible keyboard focus, the current label, and a decorative arrow hidden from assistive technology.

## Verification

- Reproduce the current failure in a browser: apply one or more listing filters, open a card, select “Back to Explore,” and observe the reset.
- After implementation, repeat the same flow and confirm the listing URL and selected controls retain search, category, price, sort, and village values.
- Verify the no-history fallback for English, Arabic, and Hebrew detail URLs.
- Run `npm run lint`.
- Run `npm run build` if the environment has the required configuration and services; report any limitation exactly.

## Out of Scope

- Adding custom vertical or horizontal scroll restoration.
- Changing how filters update the listing URL.
- Adding return query parameters, `sessionStorage`, `localStorage`, cookies, or persistence utilities.
- Changing place cards, place queries, filter semantics, results, or other navigation controls.
