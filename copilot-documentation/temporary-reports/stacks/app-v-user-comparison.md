---
title: App vs User Stack Comparison
origin: app-v-user.md
archived-on: 2025-11-10
status: draft
---

> Migrated from `app-v-user.md` on 2025-11-10 during the markdown organisation sweep.

# App vs User Stack Comparison

Legend: `✅` similar responsibilities · `🔄` partial overlap with notable drift · `⚠️` key difference · `🆕` app-only · `👤` user-only

## Core Entry Points & Fetchers

| App stack file                                                                   | User stack file                                                                    | Flag | Notes                                                                                                                                                                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/fireux-core/src/runtime/composables/firestore/core/app/useApp.ts` | `packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUser.ts` | ⚠️   | App pulls a single `app` (plus `pending`) from config-driven `appId`; user stack resolves both `coreUser` and `appUser`, aliases `user`, and wires additional deletion helpers.                   |
| `.../app/main/useAppFetch.ts`                                                    | `.../user/main/useUserFetch.ts`                                                    | ⚠️   | App fetch exposes `{ app, pending }` for a single document (string or ref ID). User fetch synthesises two docs (global + tenant overlay), returns computed refs, and omits pending state.         |
| `.../app/main/useAppCollection.ts`                                               | `.../user/main/useUserCollection.ts`                                               | ⚠️   | App collection is a straight pass-through to `firestoreFetchCollection('apps')`; user collection merges global users and tenant overlays into a composite array and exposes both raw collections. |

## Derived State & Interface Helpers

| App stack file                    | User stack file                     | Flag | Notes                                                                                                                                                                                                         |
| --------------------------------- | ----------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.../app/main/useAppComputed.ts`  | `.../user/main/useUserComputed.ts`  | ⚠️   | App computed focuses on `isInitialized`, defaulting true while fetch is pending or undefined. User computed layers authentication context, multi-CTA header states, admin checks, and `hasProfile` utilities. |
| `.../app/main/useAppInterface.ts` | `.../user/main/useUserInterface.ts` | ✅   | Both build Pill/Cell/Profile props; differences are data sources (app IDs vs user handles) but structures mirror each other.                                                                                  |

## Lifecycle & Mutation APIs

| App stack file                 | User stack file                  | Flag | Notes                                                                                                                                                                                                                              |
| ------------------------------ | -------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.../app/main/useAppEnsure.ts` | `.../user/main/useUserEnsure.ts` | 🔄   | Both ensure backing Firestore docs and app membership. User ensure additionally redirects to `/dashboard` after creation and must derive display names from Firebase auth.                                                         |
| `.../app/main/useAppUpdate.ts` | `.../user/main/useUserUpdate.ts` | ⚠️   | App updates manage descriptions, social links, join-request approval, and admin promotion (including back-populating `users` + `adminOf`). User updates focus on display-name edits and app-role changes scoped to current tenant. |
| _(none)_                       | `.../user/main/useUserDelete.ts` | 👤   | User stack includes delete stubs with progress/error refs; app stack has no equivalent removal helper.                                                                                                                             |

## Collections, Joins & Subcollections

| App stack file                          | User stack counterpart        | Flag | Notes                                                                                                                                                              |
| --------------------------------------- | ----------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.../app/subcollections/useAppUsers.ts` | _(no direct user equivalent)_ | 🆕   | Provides merged `/apps/{id}/users` overlays with cached `useUserFetch` refs. User stack relies on `useUserCollection` instead of a dedicated subcollection helper. |
| `.../app/utils/useAppJoinRequests.ts`   | _(no direct user equivalent)_ | 🆕   | Translates `app.join_requests[]` into interactive lists with approve/reject actions, caching user lookups. No matching user-stack flow.                            |

## Utility Layers & Validation

| App stack file                            | User stack file                             | Flag | Notes                                                                                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.../app/utils/forms/useAppFormatting.ts` | `.../user/utils/forms/useUserFormatting.ts` | ⚠️   | App formatting normalises descriptions, admin IDs, and social links with URL coercion. User formatting bundle also handles validation logic (display names, handles, email, bio) inside a single composable. |
| `.../app/utils/forms/useAppValidation.ts` | _(combined in user formatting file)_        | ⚠️   | App keeps validation separate from formatting; user stack merges validation + formatting functions in `useUserFormattingAndValidation`.                                                                      |
| `.../app/utils/useEnvCheck.ts`            | _(no user equivalent)_                      | 🆕   | Client-side fetch wrapper for onboarding environment checks; user stack does not perform similar preflight validation.                                                                                       |

## Documentation & Support Files

| App stack artifact | User stack artifact         | Flag | Notes                                                                              |
| ------------------ | --------------------------- | ---- | ---------------------------------------------------------------------------------- |
| _(n/a)_            | `.../user/STABLE_README.md` | 👤   | User folder documents stability expectations; app stack lacks an analogous readme. |

## Key Takeaways

- Shared Patterns: Both stacks expose a single entry composable, pair it with fetch/ensure/update helpers, and provide UI-facing prop builders. Interface helpers are deliberately aligned to make Pill/Cell/Profile APIs symmetric.
- Divergent Responsibilities: The user stack handles authentication context, profile completion flow, and deletion scaffolding. The app stack manages tenant-wide operations like join requests, admin promotion, and environment readiness.
- Utility Strategy: App utilities split formatting/validation concerns and include onboarding env checks; user utilities bundle validations with formatters and skip env checks entirely.
- Data Shape Implications: User fetch/collection layers often merge core and app overlays, while app fetchers stay single-source. This affects downstream computed state (`isInitialized` vs `headerState`) and determines which stack guards against partial data.
