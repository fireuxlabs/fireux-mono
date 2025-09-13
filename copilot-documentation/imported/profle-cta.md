---
agent-import:
  source: profle-cta.md
  imported: 2025-09-12
  note: This file was imported for AI agent context. Treat below as legacy human docs.
---

# Profile CTAs: CoreUser vs AppUser

Goal: document how CTA components behave relative to CoreUser (global) and AppUser (tenant/app-local), and note migration risks.

## Components reviewed

- Core: `packages/core/fireux-core/src/runtime/components/organisms/Profile/CTA.vue`
- Core: `packages/core/fireux-core/src/runtime/components/organisms/User/Core/CTA.vue`
- Tenant (Misebox): `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`
- Tenant (Misebox): `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue`
- Jobs extension: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/CTA.vue`
- Usage: `packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue` renders `<OrganismsProfilesChefCTA />`

## Findings

### Core: organisms/Profile/CTA.vue (generic profile CTA)

- Inputs: `profileConfig`, `ctaConfig`, `currentProfile` (props).
- Logic: purely presentational; if `!currentProfile` show “create” CTA, else show profile card + quick actions.
- Core vs AppUser: no direct dependency. Caller supplies state; compatible with core-only policy.

### Core: organisms/User/Core/CTA.vue (core account setup)

- Emits `create` for outer flow to handle core account/profile creation.
- Core vs AppUser: core-only; no AppUser usage.

### Tenant: profiles/Chef/CTA.vue (Misebox)

- Uses `useProfile(chefConfig)` → `current`, `createProfile` (global/core chef profile).
- Uses `useAppUser()` → reads `appUser.value?.profiles` to compute `hasLocal` (tenant-local state).
- Uses `useApp().profileToAppAction('add', 'chefs', id, payload)` to attach the profile to the app.
- UI states:
  - `current && hasLocal` → Complete (disabled button).
  - `current && !hasLocal` → CTA to “Add … to <App> Chefs” (local add via app action).
  - `!current && hasLocal` → Error/fallback (local without global).
  - `!current && !hasLocal` → CTA “Create Chef Profile” (global create via `createProfile`).
- Core vs AppUser: mixed. Reads tenant AppUser and writes app-local membership; creates global profile via core path.
- Migration risk: If AppUser is disabled/removed, `hasLocal` and “Add to app” must shift to a non-AppUser source (e.g., app-scoped collection or core association).

### Tenant: profiles/Supplier/CTA.vue (Misebox)

- Static link to `/suppliers/create`.
- Core vs AppUser: no direct dependency; safe if the create page uses core-only profile creation.

### Jobs: profiles/Employer/CTA.vue

- Static link to `/employers/create`.
- Core vs AppUser: no direct dependency; safe if the create page uses core-only profile creation.

## Summary

- Core CTAs (Profile/CTA, User/Core/CTA) are core-only and safe.
- Chef CTA mixes core profile creation with app-local membership via AppUser.
- Supplier/Employer CTAs are core-safe; verify their create pages follow core-only patterns.

## Recommendations

- Chef CTA: remove `useAppUser()` dependency; derive membership from an app collection (e.g., `apps/<app>/chefs/{profileId}`) or drop local membership if moving fully core-only. Keep `createProfile` for global creation. If “add to app” remains, route it through an app service/collection, not AppUser.
- Ensure `/suppliers/create` and `/employers/create` use `useProfile(<domain>).createProfile` (core) and avoid AppUser writes.
- Prefer props-first CTAs (like Core Profile CTA). Let pages/composables provide `currentProfile` and config; keep CTAs presentational.
