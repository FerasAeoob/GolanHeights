# WhatsApp Contact Method Design

## Goal

Give visitors a direct WhatsApp contact option using the Golan Wiki number `052-485-1992`.

## Placement

- Add WhatsApp to the Contact Information card on the localized contact page.
- Add WhatsApp to the footer contact list so it is available site-wide.

## Interaction

- Display `052-485-1992` in left-to-right direction in every locale.
- Link to `https://wa.me/972524851992`, using the international number format required by WhatsApp.
- Open WhatsApp in a new tab and include `rel="noopener noreferrer"`.
- Give both links a localized accessible label.

## Localization and layout

- Add a `WhatsApp` label to the English, Arabic, and Hebrew contact-page dictionaries.
- Keep the existing contact card and footer styling, spacing, responsive behavior, and RTL layout.
- Use an existing Lucide icon rather than adding a dependency.

## Scope

This is a presentation-only change. It does not alter the contact form, API routes, database models, listing contact details, or authentication.

## Verification

- Run ESLint for the affected page and footer when supported by the repository command.
- Run the production build to verify TypeScript and Next.js rendering.
- Review the diff for dictionary-key parity and unrelated edits.
