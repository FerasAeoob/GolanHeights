# Footer Social Links Design

## Goal

Update the footer social row to link to Golan Wiki's current Instagram account and add Facebook and TikTok.

## Links

- Instagram: `https://www.instagram.com/golanwiki26`
- Facebook: `https://www.facebook.com/profile.php?id=61592419696533`
- TikTok: `https://www.tiktok.com/@golanwiki`

## Presentation

- Preserve the existing compact circular footer controls and spacing.
- Render the controls in the fixed visual order Instagram, Facebook, TikTok in every locale.
- Use Lucide's Instagram and Facebook icons.
- Use Lucide's `Music2` icon for TikTok because the installed icon library has no TikTok brand glyph.
- Keep every icon decorative and give every link an explicit accessible name.

## Interaction

- Open each external profile in a new tab.
- Add `rel="noopener noreferrer"` to every link.
- Preserve visible focus styling, hover behavior, touch-target sizing, and the footer's existing RTL behavior.

## Scope

This change affects only the footer social row. It adds no dependency and does not change contact information, dictionaries, routing, APIs, database data, or authentication.

## Verification

- Run focused ESLint on the footer.
- Run the production build.
- Review the footer diff and confirm the three destinations and accessible names.
