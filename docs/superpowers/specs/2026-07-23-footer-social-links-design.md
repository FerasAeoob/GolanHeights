# Footer Social Links Design

## Goal

Make Instagram the only social network shown in the public footer and point it to the official Golan Wiki account.

## Approved behavior

- Change the footer Instagram destination to `https://www.instagram.com/golanwiki`.
- Remove Facebook and Twitter from the rendered footer rather than hiding them with CSS.
- Remove the unused Facebook and Twitter icon imports.
- Preserve the existing Instagram icon, `aria-label`, dimensions, colors, hover treatment, and footer alignment.
- Apply the same footer behavior to English, Arabic, and Hebrew without changing dictionaries or direction logic.

## Scope

- Modify only `components/Footer.tsx`.
- Do not add a social-link abstraction, dependency, translation key, or unrelated footer styling.
- Preserve the existing link navigation behavior apart from the requested destination.

## Verification

- Run ESLint against `components/Footer.tsx`.
- Run `npm run build`.
- Inspect the rendered footer DOM to confirm exactly one social link remains, its accessible name is `Instagram`, and its `href` is `https://www.instagram.com/golanwiki`.

The repository has no automated test command, so this one-file presentational change will use targeted lint, build, and rendered DOM verification rather than adding test infrastructure.
