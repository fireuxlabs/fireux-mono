# CoreUser ↔ AppUser Architecture Report

Date: 2025-09-13
Scope: Core identity and per-tenant membership (no blog subsystem)

## Summary

The system cleanly separates identity (CoreUser) from per-app membership (AppUser):

- CoreUser is the single source of truth for identity fields and global badges.
- AppUser is minimal, per-tenant, and stores only membership role and app-enabled profiles.
- Ensure and update flows reflect this split and are idempotent and safe.

## Models

- CoreUser (canonical identity)
  - id (uid), email, display_name?, avatar?, handle?, profiles? (global)
  - userOf[] (apps where user is a member), adminOf[] (apps where admin)
  - created_at, updated_at

- AppUser (tenant-scoped membership only)
  - id (uid)
  - role: 'user' | 'admin'
  - profiles?: string[] (subset enabled in this app)
  - created_at, updated_at

Rationale: Avoids identity duplication and drift across apps. AppUser only carries app-specific state.

## Creation flows

- useCoreUserEnsure
  - Ensures `core-users/{uid}` exists with: id, email, display_name (fallback to email), avatar (prefer existing → auth.photoURL → default upload → static fallback).
  - Uses serverTimestamp for created_at/updated_at and merges if doc exists.

- useAppUserEnsure
  - Validates appId and user; verifies `apps/{appId}` exists.
  - If `apps/{appId}/users/{uid}` exists, no-op.
  - Creates minimal AppUser doc `{ id, role }` (role derived from app.admin_ids → 'admin' | 'user').
  - Updates `core-users/{uid}.userOf += appId` via arrayUnion.

## Update flows

- useCoreUserUpdate
  - Core ref: `core-users/{uid}` (uid optional; defaults to current user).
  - safePayload: strips undefined/null/empty strings, blocks `email`, always sets `updated_at`.
  - Normalization/validation: lowercases + hyphenates `handle`; light URL check for `avatar`.
  - Membership helpers: add/remove to `userOf` and `adminOf` with serverTimestamp bump.
  - Field helpers: `setDisplayName`, `setAvatar`, `setHandle`, `setProfiles` (global badges).

- useAppUserUpdate
  - Tenant-scoped only (no identity). Exposes `setProfiles(profiles: string[])` to toggle app-enabled badges.
  - Identity edits (display_name, avatar, handle, email) are intentionally excluded—use CoreUser updater (and Auth for email).

## Consumption (at a glance)

- Identity reads (display_name/email/avatar/handle) should use CoreUser. AppUser is for role/profiles only.
- UI components that previously read identity off AppUser should be migrated to use CoreUser or a composed view model.

## Soundness check

- Single source of truth: Identity centralized in CoreUser prevents duplication and inconsistencies.
- Tenant boundary: AppUser contains only what varies per app (role, enabled profiles).
- Idempotent ensures: Safe to call on every auth; existing docs are preserved and updated.
- Safe updates: Input cleaning prevents accidental erasures and illegal `email` writes; timestamps are consistent.

## Edge cases and notes

- No auth or no appId: ensure functions early-return (safe).
- App not found: AppUser ensure logs and returns (no write).
- Avatar URL validation allows absolute and site-relative URLs; default avatar always available.

## Recommended enhancements (optional)

- Handle uniqueness: If globally unique handles are required, enforce via an index collection or Cloud Function.
- Role drift: Role is set at creation from `app.admin_ids`. If admin_ids change, decide whether to recompute at read, sync periodically, or trigger updates.
- Membership consistency: Writes to AppUser and CoreUser.userOf are separate; consider batched write/transaction if atomicity is required.
- Timestamps: Ensure the create helper always sets both created_at and updated_at for AppUser to satisfy the interface.

## Current status

- Core/App models and composables align with the architecture.
- `useCoreUserUpdate.ts` includes normalization, validation, and membership helpers (email blocked, updated_at enforced).
- `useAppUserUpdate.ts` limited to `setProfiles`—identity updates are removed.
- Some legacy references to AppUser identity/subscription are being retired; focus remains on CoreUser/AppUser only.

---

# Repo Hygiene and Typecheck Report — Shim Removal

Date: 2025-09-14
Scope: Repo-wide deletion of declaration shims and stabilization of typechecking

## What changed

- Removed all declaration/shim files across the repo (no local \*.d.ts remain):
  - Deleted `packages/core/fireux-core/src/runtime/types/{index.d.ts,pwa.d.ts,pwa-components.d.ts}`
  - Previously removed all app-level `projects/*/*/types/shims.d.ts`
  - Verified there are no `**/*.d.ts` files left
- Cleaned package exports to match the deletions:
  - `packages/core/fireux-core/package.json`: removed `./runtime/types` export and `typesVersions` mapping
- Updated app tsconfigs to remove references to deleted type libs:
  - Removed `"fireux-core/runtime/types"` from `compilerOptions.types` in all apps

## Why

- Align with the repo policy: no ad-hoc shim files; rely on upstream typings and Nuxt’s generated types.
- Avoid accumulating maintenance burden and divergence from vendor-provided types.

## Current typecheck result (after cleanup)

Nuxt typecheck across apps surfaced these errors:

- Missing virtual module types from @vite-pwa/nuxt runtime components (node_modules):
  - TS2307: Cannot find module `#pwa` used by: `PwaAppleImage.vue`, `PwaAppleSplashScreenImage.vue`, `PwaFaviconImage.vue`, `PwaMaskableImage.vue`, `PwaTransparentImage.vue`
- Missing optional editor dependency types:
  - TS2307: Cannot find module `@vueup/vue-quill` in:
    - `packages/core/fireux-core/src/runtime/components/molecules/forms/state/RichText.vue`
    - `packages/core/fireux-core/src/runtime/components/organisms/Blog/Create/Write.vue`
- Missing Nuxt auto-import types in a generated plugin:
  - TS2307: Cannot find module `#imports` in `.nuxt/pwa-icons-plugin.ts`

Notes:

- These were previously masked by local declaration shims. With shims removed, the issues reflect upstream virtual modules and optional deps.

## Options to get green without reintroducing shims

1. Rely on Nuxt’s generated types and exclude vendor runtime .vue components
   - Keep `extends: .nuxt/tsconfig.json` (already in place)
   - Exclude problematic vendor components from typecheck (already partially configured):
     - `**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue`
   - Remove any `paths` overrides that force-resolve `#pwa` to `@vite-pwa/nuxt` d.ts, and let Nuxt handle aliases

2. Upgrade or adjust @vite-pwa/nuxt
   - Try a newer @vite-pwa/nuxt that improves type exposure for `#pwa`
   - Alternatively, disable the PWA icons plugin during typecheck only (feature flag) to avoid bringing vendor components into the TS program

3. Install official types for optional deps
   - Add `@vueup/vue-quill` to the workspace (if we keep the RichText editor in core) so TS can resolve it without shims
   - Or gate those components to only import Quill at runtime (`onMounted` dynamic import) and avoid static type import

4. Fix `#imports` resolution during typecheck
   - Ensure `.nuxt/tsconfig.json` is extended (done) and no custom tsconfig overrides break `#imports`
   - If a generated plugin is being typechecked outside of Nuxt context, consider moving it under Nuxt’s control or excluding it from the program

## Recommended immediate steps

- Keep shim-free policy intact.
- Remove any remaining `compilerOptions.paths` entries for `#pwa` in app tsconfigs to avoid conflicting with Nuxt’s own aliasing.
- Add `@vueup/vue-quill` as a dependency in the monorepo root or in `fireux-core` peer/dep if the editor is part of core UI.
- Confirm the existing tsconfig `exclude` patterns are applied across all apps for the @vite-pwa/nuxt runtime components (\*.vue) to avoid typechecking vendor internals.

If we prefer a more robust solution:

- Evaluate upgrading `@vite-pwa/nuxt` and removing the exclude once upstream provides stable `#pwa` types.
- Optionally provide a build-time flag to skip PWA icons plugin during typecheck in CI.

## Acceptance

- [x] All local .d.ts shim files removed
- [x] fireux-core exports no longer reference deleted type files
- [x] App tsconfigs no longer reference `fireux-core/runtime/types`
- [ ] Typecheck green without shims (pending the actions above)
