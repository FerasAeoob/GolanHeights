# Optional Password Special Character Design

## Goal

Allow users to create a valid password without a special character while preserving the existing password length, uppercase-letter, lowercase-letter, and number requirements.

## Scope

The password policy is defined once in `database/user/user.schema.ts` and is reused by registration, password reset, and authenticated password change. The change will apply consistently to all three flows.

Login validation is unaffected because login accepts an existing non-empty password rather than applying new-password complexity rules.

## Design

Remove the special-character regular-expression refinement from the shared password schema. Keep these rules unchanged:

- Minimum length: 8 characters
- Maximum length: 72 characters
- At least one uppercase ASCII letter
- At least one lowercase ASCII letter
- At least one digit

Special characters remain allowed; they are simply no longer required.

Update the schema documentation and any general password-strength fallback text that still describes special characters as mandatory. Existing localized error-code entries for `PASSWORD_MISSING_SPECIAL` may be removed only if repository usage confirms they are unreachable after this change and their removal preserves dictionary shape consistency across English, Arabic, and Hebrew.

## Validation and Error Behavior

Passwords that meet the retained requirements, such as `Password1`, must pass registration, reset-password, and change-password schema validation. Passwords missing uppercase, lowercase, numeric, or length requirements must continue returning their existing error codes.

No API response shape, authentication behavior, hashing behavior, role rule, or session policy changes.

## Verification

Add a focused schema regression test that proves a password without a special character is accepted by each new-password schema. The test must fail against the current implementation before the production schema changes.

Also verify that representative passwords missing each retained requirement remain rejected. Run the focused test directly using the repository's existing Node test pattern, then run `npm run lint`.
