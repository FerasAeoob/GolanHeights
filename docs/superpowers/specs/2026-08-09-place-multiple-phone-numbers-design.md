# Place Multiple Phone Numbers Design

## Goal

Allow a place to store and display multiple labeled phone numbers without breaking existing records or consumers that still use `contact.phone`.

## Data contract

The existing `contact.phone?: string` field remains supported. Add this optional field to the same contact object:

```ts
phoneNumbers?: {
  number: string;
  label?: string;
}[];
```

Each stored number is trimmed and must be non-empty. Labels are optional; blank labels are omitted. Empty rows from the admin form are not persisted.

New and edited places use dual-write compatibility: `contact.phoneNumbers` stores the complete ordered list, and `contact.phone` mirrors the first number or becomes an empty string when the list is empty. Existing database records require no migration.

For reads, a non-empty valid `contact.phoneNumbers` array is authoritative. If it is missing or empty, consumers derive a single effective entry from a non-empty legacy `contact.phone` value. The legacy field is not appended when the array exists, preventing duplicate display.

## Validation and persistence

- Extend the Place TypeScript interfaces and Mongoose contact subdocument with `phoneNumbers` while retaining `phone`.
- Reuse one Zod phone-entry schema in both create and update Place schemas.
- Accept optional `phoneNumbers` through both server-action and REST API create/update paths.
- Normalize admin submissions before validation so numbers and labels are trimmed, blank rows are removed, blank labels are omitted, and `phone` mirrors the first remaining number.
- Preserve the existing authentication, authorization, error-response, DTO, and cache behavior.
- Update the Mongoose hot-reload schema guard so an already-compiled model without the new nested path is rebuilt during development.

## Admin form

Replace the single phone input in the existing contact card with a compact repeatable list. Each row contains a phone input, an optional label input, and a semantic Remove button. An Add phone number button appends a blank row.

When editing a modern record, initialize rows from `phoneNumbers`. When editing a legacy record, initialize one row from `phone`. A new place starts with no phone rows. Phone inputs use `dir="ltr"`; surrounding labels, controls, spacing, and focus behavior continue to follow the active locale. New user-facing copy is added with matching keys in the English, Arabic, and Hebrew dictionaries.

No unrelated admin fields or layout sections are redesigned.

## Public place page

Pass both `contact.phoneNumbers` and `contact.phone` into the existing Place contact details component. Resolve one effective ordered list using the compatibility rule above, then render it in the existing phone row in both desktop and mobile layouts.

Every number is an anchor with a `tel:` target. The visible number is isolated with `dir="ltr"` for mixed-direction safety. If a label exists, it is displayed beside or above its number without translating business-provided label text.

## Verification

- Confirm repository search results contain no unhandled Place `contact.phone` consumer; user-profile phone behavior remains out of scope.
- Run `npm run lint` and `npm run build`.
- Exercise create, edit, add, remove, labeled, unlabeled, and legacy-fallback behavior.
- Check the affected admin and public contact UI at mobile and desktop widths in English, Arabic, and Hebrew, including keyboard focus and `tel:` targets.
- The repository has no configured automated test command. Do not claim automated tests passed unless a real runner is discovered or added during implementation.

## Scope boundaries

- No database migration or removal of `contact.phone`.
- No changes to user-account/profile phone fields.
- No new dependencies.
- No unrelated UI redesign or refactor.
