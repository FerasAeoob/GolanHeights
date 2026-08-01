# Profile Logout Redirect Design

## Goal

Logging out from the profile page must clear the authenticated session and navigate to the localized home page instead of displaying the JSON response from `/api/auth/logout`.

## Root Cause

The profile page submits a native HTML form directly to the logout API. The endpoint correctly returns JSON for programmatic callers, so the browser replaces the profile page with that response. The mobile drawer already avoids this behavior by calling the same endpoint with `fetch`.

## Architecture and Flow

Move the profile logout control into a focused Client Component. When activated, it will POST to the existing `/api/auth/logout` endpoint with `fetch`. After a successful response, it will navigate with `router.replace` to `/` for English, `/ar` for Arabic, or `/he` for Hebrew.

Keep the logout route's current JSON response contract so the mobile drawer and other programmatic callers remain compatible. Do not change authentication, cookie, or authorization behavior.

## Interaction and Error Handling

- Preserve the existing button appearance and translated logout label.
- Disable the button while logout is pending to prevent duplicate submissions.
- If the request fails or returns a non-success response, remain on the profile page, re-enable the button, and show a localized inline error.
- Do not navigate the browser to the API route under any outcome.

## Localization

Use the existing locale supplied by the profile page. English retains its clean unprefixed URL, while Arabic and Hebrew use locale-prefixed home routes. Add any new failure-message key with the same dictionary shape in English, Arabic, and Hebrew.

## Verification

The repository does not currently define an automated test command. Run the available lint command and a production build if feasible. Exercise logout in English, Arabic, and Hebrew to confirm that the session is cleared, the localized home URL is used, duplicate clicks are prevented, and request failures do not navigate away from the profile page.
