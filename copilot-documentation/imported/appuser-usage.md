---
agent-import:
  source: appuser-usage.md
  imported: 2025-09-12
  note: This file was imported for AI agent context. Treat below as legacy human docs.
---

# AppUser usage audit

Date: 2025-09-11

This report inventories AppUser references (models, composables, pages, components, migrations, docs) with locations, context, purpose, and risk if AppUser were removed/disabled (e.g., for Misebox). Use this to guide migration to CoreUser-only flows.

Notes

- Line numbers reflect current main branch at generation time; nearby edits may shift exact positions slightly.
- Risk: Low (easy to delete/replace), Medium (needs refactor), High (critical flow or widely-used foundation).

## Models

- `packages/core/fireux-core/src/runtime/models/core/appUser.model.ts`
  - Lines: 2, 7–19
  - Context: Type definitions for AppUser and Author.
  - Purpose: Canonical tenant-scoped AppUser schema; Author reused in blog models.
  - Risk: High (underpins AppUser subsystem).

- `packages/core/fireux-core/src/runtime/models/index.ts`
  - Line: 2
  - Context: Re-exports AppUser, SubscriptionInfo.
  - Purpose: Public model surface.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/models/objects/blogPost.model.ts`
  - Line: 1
  - Context: Imports Author from AppUser model.
  - Purpose: Attribution type.
  - Risk: Low (can point to CoreUser projection).

- `packages/core/fireux-core/src/runtime/models/utils/avatarManager.ts`
  - Lines: 4, 57, 65, 81
  - Context: Avatar strategy comments including AppUser.
  - Purpose: Guidance/utilities.
  - Risk: Low.

## Core composables: AppUser

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser.ts`
  - Lines: 5, 14–20, 23–33, 35–45, 49–55
  - Context: Subscription to `apps/${appId}/users/{uid}` + collection.
  - Purpose: Primary read layer for AppUser state.
  - Risk: High.

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserEnsure.ts`
  - Lines: 15, 22, 31, 54, 65, 90, 137–149, 157
  - Context: Ensures AppUser exists, writes to `apps/${appId}/users/{uid}`; updates CoreUser.userOf.
  - Purpose: Creation/upsert.
  - Risk: High.

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserComputed.ts`
  - Lines: 1, 6
  - Context: Derived flags (isAppUser, isAdmin, initials).
  - Purpose: UI helpers.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserUpdate.ts`
  - Lines: 4, 73–74, 91, 97, 372, 491–496
  - Context: Field updates and AppUser.profiles array updates.
  - Purpose: Mutations.
  - Risk: High (where used), Medium for Misebox if bypassed.

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserDelete.ts`
  - Context: Delete APIs.
  - Purpose: Remove AppUser docs.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts`
  - Line: 5
  - Context: Subscription helpers.
  - Purpose: Reactive sync.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserUtils.ts`
  - Line: 5
  - Context: Utils (generateHandle/Slug).
  - Purpose: Shared helpers.
  - Risk: Low.

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/utils/*`
  - Files: useAppUserFormatting.ts, useAppUserValidation.ts, useAppUserState.ts
  - Context: Formatting/validation/state.
  - Purpose: Support layer.
  - Risk: Low–Medium.

- `packages/core/fireux-core/src/runtime/composables/app/user/useAppUserState.ts`
  - Lines: 2, 6
  - Context: Nuxt state wrapper for hydrated AppUser.
  - Purpose: UI reads without new subscriptions.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/composables/app/useEnsureApp.ts`
  - Lines: 124–127
  - Context: Imports and calls ensureAppUser in app ensure flow.
  - Purpose: Onboarding chain.
  - Risk: High.

## Core plugins

- `packages/core/fireux-core/src/runtime/plugins/app-user.client.ts`
  - Lines: 4–13
  - Context: Hydrates AppUser into Nuxt state via watch.
  - Purpose: Global state availability.
  - Risk: Medium.

## Core composables: Profiles coupling to AppUser

- `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts`
  - Lines: 6–7, 36–55, 46–73, 100–123
  - Context: Reads AppUser; updates `AppUser.profiles` after creating global profile.
  - Purpose: Sync arrays.
  - Risk: High (must guard/skip for Misebox).

- `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileDelete.ts`
  - Lines: 5–6, 37–47, 44–55
  - Context: Reads AppUser; removes entry from `AppUser.profiles`.
  - Purpose: Sync arrays.
  - Risk: Medium.

## Core UI: components and pages

- `packages/core/fireux-core/src/runtime/components/organisms/Auth/Authenticated.vue`
  - Lines: 2, 4, 13, 19–20
  - Context: CTA depends on appUser; calls ensureAppUser.
  - Purpose: Onboarding.
  - Risk: High.

- `packages/core/fireux-core/src/runtime/components/layouts/Header.vue`
  - Lines: 22–23, 71, 73
  - Context: Displays appUser avatar/name.
  - Purpose: Header UI.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/components/layouts/dashboard/Guard.vue`
  - Lines: 31, 53, 65, 75, 84
  - Context: Gate routes on appUser presence; calls ensureAppUser.
  - Purpose: Access control.
  - Risk: High.

- `packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/AvatarSelection.vue`
  - Lines: 65–70
  - Context: Reads appUser for avatar updates.
  - Purpose: Avatar editing.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/components/organisms/User/App/Cards/Pill.vue`
  - Lines: 5–15, 22, 25
  - Context: Presentational AppUser card.
  - Purpose: Display.
  - Risk: Low.

- `packages/core/fireux-core/src/runtime/pages/dev/app-users.vue`
  - Lines: 5, 8, 12, 17, 22, 28, 53–54
  - Context: Dev-only page for AppUser.
  - Purpose: Debug.
  - Risk: Low.

- `packages/core/fireux-core/src/runtime/pages/dashboard/index.vue`
  - Lines: 66–67, 86
  - Context: Displays appUser details.
  - Purpose: Dashboard summary.
  - Risk: Medium.

- `packages/core/fireux-core/src/runtime/pages/dashboard/profile.vue`
  - Lines: 3, 5, 8, 42
  - Context: AppUser profile edit/display.
  - Purpose: Manage AppUser.
  - Risk: Medium.

## Tenants: Misebox

- `packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue`
  - Line: 31
  - Context: `{ appUser, hasProfile } = await useAppUser()`; uses profiles array for gating.
  - Purpose: Chef UI flow.
  - Risk: Medium.

- `packages/tenants/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue`
  - Line: 31
  - Context: Same as above for suppliers.
  - Purpose: Supplier UI flow.
  - Risk: Medium.

- `packages/tenants/fireux-misebox/src/runtime/pages/chefs/[id].vue`
  - Lines: 8, 49
  - Context: Ownership check `appUser?.uid === chef.uid`; uses useAppUser.
  - Purpose: Edit guard.
  - Risk: Medium.

- `packages/tenants/fireux-misebox/src/runtime/pages/suppliers/[id].vue`
  - Lines: 8, 51
  - Context: Ownership check; uses useAppUser.
  - Purpose: Edit guard.
  - Risk: Medium.

- `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`
  - Lines: 44–51
  - Context: Reads appUser; checks `AppUser.profiles` for local presence.
  - Purpose: CTA state.
  - Risk: Medium.

- `packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue`
  - Line: 8
  - Context: `{ hasProfile } = await useAppUser()` in layout.
  - Purpose: Route/UX gating.
  - Risk: Medium–High.

## Tenants: Cleanbox (references)

- `packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDefault.vue`
  - Lines: 8–11
  - Context: Declares/uses useAppUser hasProfile.
  - Purpose: Layout gating.
  - Risk: Medium.

- `packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDashboard.vue`
  - Lines: 8–11
  - Context: Same as above.
  - Purpose: Layout gating.
  - Risk: Medium.

## Extensions: fireux-jobs

- `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/employer-profile.vue`
  - Line: 31
  - Context: `{ appUser, hasProfile } = await useAppUser()`.
  - Purpose: Employer profile UX.
  - Risk: Medium.

- `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional-profile.vue`
  - Line: 31
  - Context: Same as above for professionals.
  - Risk: Medium.

- `packages/extensions/fireux-jobs/src/runtime/pages/employers/[id].vue`
  - Lines: 8, 51
  - Context: Ownership check via appUser.uid; uses useAppUser.
  - Risk: Medium.

- `packages/extensions/fireux-jobs/src/runtime/pages/professionals/[id].vue`
  - Lines: 9, 54
  - Context: Ownership check; uses useAppUser.
  - Risk: Medium.

- `packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue.fixed`
  - Lines: 41, 44, 47
  - Context: References AppUser/appusers in a fixed artifact.
  - Risk: Low (clean up).

- `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Create/System.vue`
  - Lines: 17, 21, 26, 95, 120, 139–140
  - Context: Displays & uses AppUser fields to prefill.
  - Purpose: Form defaults.
  - Risk: Medium.

- `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Create/System.vue`
  - Lines: 18, 22, 27, 157, 220, 239–242
  - Context: Displays & uses AppUser fields to prefill.
  - Purpose: Form defaults.
  - Risk: Medium.

## Scripts and migrations

- `scripts/migrate-misebox-app-users.ts`
  - Lines: 1, 5, 8, 11, 14, 25, 129–174
  - Context: Migrates from `apps/misebox-app/users` to `core-users`; backups include app-users.
  - Purpose: Data migration.
  - Risk: Low.

- `scripts/migrate-core-users.js`
  - Lines: 87–101, 144–256, 279–303, 230–238
  - Context: Legacy migration script referencing AppUsers.
  - Purpose: Data utilities.
  - Risk: Low.

- `migrations/backups/backup-misebox-app-app-users-2025-09-11.json`
  - Line: 3
  - Context: Backup metadata (collectionPath: `apps/misebox-app/users`).
  - Purpose: Audit trail.
  - Risk: Low.

## Docs and internal references

- `profile-creation.md` / `profile-creattion.md`
  - Lines: 8, 61, 94, 97, 102–105, 113, 130, 138, 143
  - Context: Policy to avoid writes to `apps/<appId>/users/*`; remove AppUser dependencies.
  - Purpose: Migration policy.
  - Risk: Low.

- `docs/user.md`
  - Lines: 1–9, 45, 49, 58, 73, 75, 111–117, 126
  - Context: Explains Auth/CoreUser/AppUser interactions and composables.
  - Purpose: Architecture docs.
  - Risk: Low.

- `misebox.md`
  - Lines: 1–78, 92–119, 139, 152–165, 176–196, 232–249
  - Context: Tenant plan to disable AppUser subsystem and use global profiles.
  - Purpose: Migration plan.
  - Risk: Low.

- `layout.md`
  - Lines: 3, 56, 69, 96, 109, 389, 407, 439, 442, 460, 463, 493, 504
  - Context: References to `useAppUser` in layout docs/examples.
  - Purpose: Internal documentation.
  - Risk: Low.

## Summary

- Total files affected: ~40+
- Risk distribution (approximate):
  - High: 7 (core AppUser composables, ensure chain, Auth/Guard components, profile create coupling, core model export)
  - Medium: ~20 (tenant and extension pages/components; core header/dashboard/profile UIs)
  - Low: ~15 (docs, migrations, backups, dev pages/components, utilities)

## Recommendations

- Swap to CoreUser/global profile presence
  - Replace `useAppUser()` usages with `useProfile(profileConfig)` or `useCoreUser()`; detect presence via global doc instead of `AppUser.profiles`.
  - Ownership checks: Use `useCurrentUser()` or `useCoreUser().coreUser?.id` against profile.uid.

- Disable AppUser for Misebox
  - Confirm a runtime flag `disableAppUsers: true`. In `useAppUserEnsure`, early return when disabled.
  - Provide a tenant shim for `useAppUser()` returning a neutral object: `{ appUser: computed(() => null), appUsers: [], ensureAppUser: async () => {}, hasProfile: () => false }`.

- Decouple profiles composables
  - In `useProfileCreate.ts` and `useProfileDelete.ts`, guard the `AppUser.profiles` mutation blocks with `if (!config.disableAppUsers && appUser.value) { ... }`.

- Triage core UI
  - Auth/Guard: Use CoreUser-only gating for Misebox. Hide "Create App User" CTA when disabled.
  - Header/dashboard/profile UIs: Prefer CoreUser data for avatar/name; render AppUser widgets only when enabled.

- Data cleanup
  - Keep migration scripts/backups for audit. After validation, delete `apps/misebox-app/users/*` and enforce Firestore rules to block writes.

- Longer-term consolidation
  - Consider extracting the AppUser subsystem into an extension/module used only by tenants that need it (e.g., Niederhorn). Keep core focused on CoreUser + global profiles.
