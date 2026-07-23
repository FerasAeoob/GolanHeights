# Place Share Button Design

## Goal

Add a share action to the place details card so visitors can share the current localized place page from desktop or mobile.

## User Experience

- Show a full-width secondary share button directly below the existing action buttons in both desktop and mobile details cards.
- Use a share icon and a localized label.
- On browsers that support the Web Share API, open the native share menu with the localized place title and current page URL.
- If native sharing is unavailable, copy the current page URL to the clipboard.
- After a successful clipboard fallback, briefly replace the label with localized “Link copied” feedback.
- If clipboard copying fails, briefly show a localized failure message.
- Treat cancellation of the native share menu as a normal outcome and show no error.

## Architecture

Keep the existing place details card server-rendered. Add a small focused Client Component for the browser-only share interaction and render it from `components/places/place.sidedetails.tsx`.

The localized place title is passed from the place page into the details card and then into the share button. The button reads `window.location.href` when activated so the shared URL preserves the current locale, localized slug, query string, and URL fragment.

## Styling and Accessibility

- Match the width, height, radius, spacing, and typography of the existing Waze and booking actions.
- Use secondary styling so the share action does not compete visually with navigation or booking.
- Use a semantic `button` with a visible keyboard focus state and an accessible localized name.
- Keep the icon decorative to assistive technology.
- Maintain a touch target of approximately 44 pixels.
- Avoid directional assumptions so English, Arabic, and Hebrew layouts remain correct.

## Localization

Add consistent keys to `dictionaries/en.json`, `dictionaries/ar.json`, and `dictionaries/he.json` for:

- Share
- Link copied
- Unable to copy link

## Error Handling

- Ignore native share cancellation, including `AbortError`.
- If native sharing throws a non-cancellation error, attempt the clipboard fallback.
- Disable the button only while an action is actively running to prevent duplicate share requests.
- Restore the normal label after temporary success or failure feedback.

## Validation

- Run `npm run lint`.
- Review the diff for unrelated changes.
- Exercise the place details page at mobile and desktop widths.
- Check native-share and clipboard-fallback behavior where browser support permits.
- Check English, Arabic, and Hebrew labels, alignment, focus visibility, and absence of overflow.
