# Utils Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/utils` only.

Learn how `runtime/utils/` is used across FireUX module packages.

## Utils Directory

`utils/` contains shared runtime utilities when they genuinely belong to a shared runtime surface.

## What Belongs Here

- runtime helper functions reused across runtime features
- utilities that are clearly part of runtime delivery

## Aligned In Repo

- `runtime/utils/` is already used in `fireux-core`
- this shows the directory is valid when it stays clearly runtime-scoped
- public slug/path helpers live in `fireux-core/src/runtime/utils/slug`
- server-side slug availability helpers live in `fireux-core/src/runtime/server/utils/slug`

## Public Slug Utilities

Use the core slug helpers when a public route segment, handle, slug, or light
resource path needs validation:

- `normalizeSlug` normalizes user input into a stable URL segment
- `validatePublicSlug` checks format and reserved route keys
- `assertPublicSlug` validates and optionally checks availability
- `checkPublicSlugAvailability` is the server helper for app-owned availability
  endpoints

Apps still own their collection-specific existence check. For example, a light
resource route can ask core to validate `my-doc`, then check its own Firestore
collection to decide whether the path is taken.

## Not Aligned Yet

- `runtime/utils/` is uncommon across package families
- utility folders always carry a risk of becoming generic overflow buckets

## Roadmap To Reconciliation

1. Keep runtime utilities narrow.
2. Prefer feature-local placement when that is clearer.
3. Avoid turning `utils/` into an ungoverned catch-all.

## Short Version

Shared runtime utilities belong here only when they truly reduce ambiguity.
