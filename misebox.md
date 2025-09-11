# Misebox Tenant Report — AppUser & Profile Scope Rationalization

Date: 2025-09-11
Related Tenants: `misebox-app` (this doc), `niederhorn` (contrast only)
Status Goal: Remove tenant‑scoped AppUser + tenant‑scoped profile coupling for Misebox; retain only global profile ecosystem (chefs, suppliers). Preserve full AppUser flow for Niederhorn (spin‑off app needing per‑app identity & local collections).

---

## 1. Executive Summary

Misebox currently participates in the shared **AppUser** subsystem (documents at `apps/{appId}/users/{uid}`) and also uses profile creation flows that assume an AppUser exists (to append profile metadata into `appUser.profiles`). We want Misebox to:

- Stop creating / depending on `apps/misebox-app/users/*` documents.
- Treat chef & supplier profiles as **global-only** (no app‑scoped mirrors, no `profiles[]` array writes).
- Continue reading global profile collections (e.g. `chefs`, `suppliers`) and optionally copy _selected_ global profiles into app-specific collections only where explicitly needed by **other apps** (e.g. Niederhorn) — NOT for Misebox itself.

Niederhorn will remain a consumer of full AppUser flow (local `apps/niederhorn/users/*` and optional local profile pivots like `apps/niederhorn/chefs/*`).

Outcome: Reduced duplication, simpler onboarding for Misebox, clearer separation of global talent marketplace (Misebox) vs app‑centric environments (Niederhorn).

---

## 2. Current Implementation (Misebox)

### 2.1 AppUser Creation Path

| Concern                             | Where It Happens                                                                                                                             | Notes                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Ensuring AppUser doc                | `useAppUserEnsure()` → `ensureAppUser()` (core)                                                                                              | Called indirectly by auth flows / guarded pages.                                |
| Subscription to AppUser             | `useAppUser()` (core)                                                                                                                        | Fetches `apps/{appId}/users/{uid}` and collection of all app users.             |
| Invocation in Misebox pages/layouts | `packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue`, `MiseboxDashboard.vue`, profile pages, chefs/suppliers pages       | Primarily for `hasProfile`, `appUser`, gating UI.                               |
| Profile creation array update       | `useProfileCreate()`                                                                                                                         | Always attempts to update `AppUser.profiles` after global profile doc creation. |
| Profile CTAs referencing AppUser    | `components/organisms/profiles/Chef/CTA.vue` uses `useApp()` / `profileToAppAction`; Chef & Supplier profile pages reference `useAppUser()`. |

### 2.2 Firestore Collections (Misebox)

| Collection                   | Scope                          | Needed Post‑Change?    | Rationale                                                   |
| ---------------------------- | ------------------------------ | ---------------------- | ----------------------------------------------------------- |
| `apps/misebox-app/users`     | Tenant                         | NO                     | We will not maintain per‑app app user identity for Misebox. |
| `chefs`                      | Global                         | YES                    | Source of truth for chef marketplace.                       |
| `suppliers`                  | Global                         | YES                    | Source of truth for supplier marketplace.                   |
| `apps/misebox-app/chefs`     | Tenant mirror (dev playground) | NO (or mark as legacy) | Remove local duplication to avoid drift.                    |
| `apps/misebox-app/suppliers` | (If present / potential)       | NO                     | Same as above.                                              |

### 2.3 Coupling Points to AppUser

| File                                   | Coupling Mechanism                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `useProfileCreate.ts` (core)           | Assumes existence of `appUser` to update profiles array.                                          |
| `useProfileDelete.ts` (core)           | Same assumption for reverse update.                                                               |
| `Chef/CTA.vue` / `Supplier` components | Use `profileToAppAction` (app-scoped promotion).                                                  |
| Layout / Dashboard pages               | Resolve `hasProfile` via `useAppUserComputed(appUser)` rather than global profile presence alone. |
| `useAppUserRoutes.ts`                  | Builds navigation groups conditional on `isAppUser/isAdmin`.                                      |

---

## 3. Target State (Misebox)

| Aspect                          | Target Behavior                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| AppUser docs                    | Never created for `misebox-app` (skip ensure).                                                                         |
| Auth gating                     | Operates on **core user** presence only.                                                                               |
| Profile creation                | Writes only to global collection (`chefs`, `suppliers`), does **not** patch an AppUser `profiles[]`.                   |
| UI profile detection            | Uses direct global query (`useProfile(config)` → `current`) or existence of global doc, not `hasProfile` from AppUser. |
| Navigation                      | Remove / suppress AppUser-dependent dashboard routes.                                                                  |
| Tenant local collections        | Eliminated (no `apps/misebox-app/chefs`).                                                                              |
| Cross‑app feature (copy to app) | Still allowed when acting _as a source_ for other apps (handled externally, e.g. Niederhorn copying).                  |

---

## 4. Gap Analysis & Chord Sever Points

| Area                                          | Current Mechanism                                                    | Change Needed                       | Implementation Strategy                                            |
| --------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| Ensure AppUser                                | `useAppUserEnsure()` call chain via `useEnsureApp` / auth components | Bypass for Misebox                  | Introduce runtime flag `disableAppUsers` and conditional no‑op.    |
| Subscriptions                                 | `useAppUser()` inside Misebox components                             | Replace with shim                   | Provide tenant override `useAppUser()` returning neutral object.   |
| Profile create/update arrays                  | `useProfileCreate()` updates `AppUser.profiles`                      | Make optional / skip when disabled  | Guard update block: only if `appUser` + not disabled.              |
| hasProfile computation                        | Derived from `appUser.value?.profiles`                               | Recompute from global doc existence | Add `useGlobalProfilePresence(type)` helper or adapt `useProfile`. |
| UI conditionals (CTA vs edit)                 | `if (hasProfile('chef'))`                                            | Use global doc existence            | Replace references in Misebox pages.                               |
| Local app profile push (`profileToAppAction`) | Used in Chef CTA                                                     | Remove for Misebox (or hide button) | Conditional hide via flag.                                         |

---

## 5. Proposed Implementation Steps

### 5.1 Add Runtime Flag

Add to `projects/misebox/misebox-app/nuxt.config.ts`:

```ts
fireux: {
  disableAppUsers: true
}
```

(Or nested under existing runtime config module — match current pattern in `useFireUXConfig`).

### 5.2 Extend `useFireUXConfig`

Augment returned config object to surface `disableAppUsers` (default false).

### 5.3 Core Guard Updates

1. `useAppUserEnsure.ts`: Early return if `disableAppUsers`.
2. `useAppUser.ts`: If disabled → return stub structure:

```ts
return { appUser: computed(() => null), appUsers: [], ensureAppUser: async () => {}, /* computed flags default false */, hasProfile: () => false }
```

3. `useProfileCreate.ts` & `useProfileDelete.ts`: Wrap `AppUser.profiles` array mutation blocks:

```ts
if (!config.disableAppUsers && appUser.value) {
  /* existing update logic */
}
```

(Access `disableAppUsers` via `useFireUXConfig()`.)

### 5.4 Tenant-Level Override (Low-Intrusion Alternative)

If avoiding core edits initially: create `packages/tenants/fireux-misebox/src/runtime/composables/overrides/useAppUser.ts` that shadows auto-import (Nuxt auto-import precedence) and returns the stub described. This instantly decouples Misebox without touching core until refactor approved.

### 5.5 Replace `hasProfile` Usage

In Misebox pages:

- Derive existence: `const { current: chef } = await useProfile(chefConfig)` then `const hasChef = computed(() => !!chef.value)`.
- Remove `hasProfile('chef')` variant.
  Do same for supplier.

### 5.6 Remove Local Collections

Audit and delete any code writing to `apps/misebox-app/chefs` or `profileToAppAction('add', 'chefs', ...)` in Misebox tenant (keep example in dev playground but mark deprecated or guard by flag for backward reference only).

### 5.7 Navigation / Routes

In `useAppUserRoutes.ts` or call sites, conditionally skip injecting AppUser route group when `disableAppUsers` is true.

### 5.8 Documentation & Migration

- Add section to this doc after completion: “Migration Completed (date) – no tenant AppUsers for Misebox”.
- Update `docs/user.md` clarifying difference between Misebox (global only) and Niederhorn (app-scoped + global hybrid allowed).

---

## 6. Niederhorn Contrast (Retain Behavior)

| Aspect                    | Niederhorn                              | Misebox (After Change)             |
| ------------------------- | --------------------------------------- | ---------------------------------- |
| AppUser docs              | YES (`apps/niederhorn/users/{uid}`)     | NO                                 |
| ensureAppUser             | Always on auth                          | Disabled / no-op                   |
| AppUser.profiles array    | Source of dashboard gating              | Not used                           |
| Local app profile mirrors | Allowed (e.g. `apps/niederhorn/chefs`)  | Not used                           |
| Global profile reading    | YES                                     | YES                                |
| Cross-app profile import  | Can import from global (Misebox source) | Not applicable (Misebox is source) |

---

## 7. Firestore Impact Summary

| Resource                       | Action                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `apps/misebox-app/users/*`     | Stop creating new docs; optionally archive or delete existing after audit.      |
| `apps/misebox-app/chefs/*`     | Remove; rely solely on `chefs/*`.                                               |
| `apps/misebox-app/suppliers/*` | Remove (if present).                                                            |
| Security Rules                 | Simplify: remove per-app user rule branches for Misebox; retain for Niederhorn. |

---

## 8. Risk & Mitigation

| Risk                                           | Impact                     | Mitigation                                                                                            |
| ---------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Components expecting `hasProfile` from AppUser | Runtime errors / undefined | Provide shim returning safe defaults until components refactored.                                     |
| Legacy data orphaning                          | Confusion in analytics     | Export & snapshot `apps/misebox-app/users` before deletion; write migration note.                     |
| Mixed assumptions in shared composables        | Subtle bugs                | Introduce explicit flag & conditionals; add console.warn if a blocked path is invoked while disabled. |
| Security rules mismatch                        | Access denied              | Update rules concurrently: treat Misebox as global-only.                                              |

---

## 9. Incremental Rollout Plan

1. Phase 0 (Prep): Add config flag + tenant override shim (no functional removals yet) — verify UI still renders.
2. Phase 1 (Detach Writes): Guard `ensureAppUser` + profile array mutations; remove local collection writes.
3. Phase 2 (UI Refactor): Replace `hasProfile` dependencies with direct global queries.
4. Phase 3 (Data Cleanup): Snapshot & delete `apps/misebox-app/users` & local profile mirrors.
5. Phase 4 (Rule & Doc Update): Adjust Firestore security rules + docs.
6. Phase 5 (Removal of Shim): If core conditionals merged, drop tenant override.

---

## 10. Code Change Checklist

- [ ] Add `disableAppUsers` flag to config.
- [ ] Expose flag via `useFireUXConfig`.
- [ ] Core: Early return in `useAppUserEnsure`.
- [ ] Core: Conditional stub in `useAppUser`.
- [ ] Core: Guard profile array updates in `useProfileCreate` / `useProfileDelete`.
- [ ] Tenant: Override `useAppUser` (optional transitional).
- [ ] Tenant: Refactor profile pages (chef/supplier) to not call `hasProfile` from app user.
- [ ] Remove / guard `profileToAppAction` usage in Misebox CTA components.
- [ ] Data: Export & clean legacy tenant AppUser docs.
- [ ] Docs: Update `docs/user.md` + add migration note here.

---

## 11. Validation Strategy

| Check                               | Method                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| No new AppUser docs                 | Create new user in Misebox dev, inspect Firestore path.                                          |
| Profiles still creatable            | Create chef profile; verify global `chefs/{uid}` exists.                                         |
| UI gating Works                     | Chef edit page appears when global doc exists.                                                   |
| Global → Niederhorn copy unaffected | Use existing `profileToAppAction` from Niederhorn dev to copy chef into `apps/niederhorn/chefs`. |
| Type safety intact                  | Run `pnpm typecheck:packages`.                                                                   |
| CI unaffected                       | Push branch; ensure CI passes w/o AppUser dependencies for Misebox.                              |

---

## 12. Post‑Migration Cleanup Opportunities

- Remove redundant `profiles[]` logic for non‑AppUser tenants entirely (abstract with strategy pattern).
- Introduce `useProfilePresence(profileType, scope='global'|'app')` to unify detection logic.
- Metrics: Add lightweight analytics event for profile creation source (Misebox vs imported).

---

## 13. Summary Table (Misebox vs Niederhorn)

| App        | Current AppUser Flow                                                                                         | Needs Change? | Target Flow                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------------- |
| Misebox    | Ensures + subscribes to `apps/misebox-app/users/{uid}`; updates `profiles[]`; optional local profile mirrors | YES           | No AppUser creation; global profiles only; direct global profile presence checks |
| Niederhorn | Full AppUser ensure + local and global profiles; navigation gated by AppUser state                           | NO            | Maintain current AppUser + hybrid profile model                                  |

---

## 14. Decision Snapshot

Decision: Disable AppUser subsystem for Misebox; retain for Niederhorn.
Benefits: Reduced Firestore writes, simpler conceptual model, avoids duplicated profile data, clear division of responsibility between marketplace (global) and app-specific environment (Niederhorn).

---

## 15. Next Actions (Immediate)

1. Implement tenant override shim OR core flag gating.
2. Refactor Misebox profile pages (`chef-profile.vue`, `supplier-profile.vue`, index listings) to drop `hasProfile` from AppUser.
3. Guard profile array updates.
4. Open PR titled: `feat(misebox): disable tenant AppUsers + global-only profiles`.

---

> Update this document inline as each checklist item completes. Keep as authoritative log for the Misebox identity simplification.
