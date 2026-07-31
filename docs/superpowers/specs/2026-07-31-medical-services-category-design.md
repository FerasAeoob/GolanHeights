# Medical Services Category Design

## Goal

Add a standalone `medical-services` place category that behaves and looks like the existing public categories in English, Arabic, and Hebrew.

## Category Definition

- Stable slug: `medical-services`
- English label: `Medical Services`
- Arabic label: `الخدمات الطبية`
- Hebrew label: `שירותים רפואיים`
- Scope: clinics, doctors, pharmacies, dentists, and similar health-related services
- Visual treatment: a medical icon, a distinct category gradient, and a dedicated image presented through the existing category-card component

## Implementation

Add the slug and display metadata to the shared category source of truth in `lib/categories.ts`. Existing consumers of that list will then expose the category on the homepage, in place filters, and in the admin place form. The shared slug tuple will also update the TypeScript category type, Zod create/update validation, and the Mongoose enum without duplicating the value.

Add matching `categories` and `categoriesDesc` entries to all three dictionary files. Extend the place-card category color map so medical listings receive an intentional badge style rather than relying on an undefined class.

No routes, database migration, new dependency, or category-specific component will be introduced.

## Data Flow

An administrator selects `medical-services` in the existing place form. The existing server action validates it through the shared Zod enum and persists it through the shared Mongoose enum. Public pages query the unchanged `category` field, while cards and filters resolve the label from the active locale dictionary.

## Error Handling and Compatibility

The slug follows the existing lowercase kebab-case URL convention. Existing places and category URLs remain unchanged. Missing localized place content continues to use the repository's current fallback behavior; category labels themselves will be present in every supported dictionary.

## Verification

Run:

- `npm run lint`
- `npm run build`

The repository currently has no verified automated test command, so verification will rely on these repository-supported static and production-build checks plus inspection of the final diff.
