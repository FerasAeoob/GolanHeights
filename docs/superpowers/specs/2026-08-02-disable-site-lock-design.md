# Disable Site Lock Design

## Goal

Disable the private-preview site lock while keeping the feature available for future use.

## Change

Remove `SITE_ACCESS_CODE` from the ignored local environment file. The proxy activates the lock only when this variable has a non-empty value, so its absence makes normal site and API routing proceed without checking the `site_unlocked` cookie.

The lock page, unlock API route, JWT handling, and proxy implementation remain unchanged and dormant.

## Scope

- Change only the local environment configuration.
- Do not modify authentication, authorization, localization, or public routing.
- Do not alter the user's existing unrelated working-tree changes.
- Production or preview deployments that independently define `SITE_ACCESS_CODE` must have that deployment variable removed separately.

## Verification

- Confirm the local environment file no longer defines `SITE_ACCESS_CODE`.
- Run the repository lint command.

