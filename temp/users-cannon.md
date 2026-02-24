# Users Canon Report

Scope: current worktree state for `/users` routing, user identity, and handle strategy in FireUX runtime (core + app consumers).

This report is intentionally route-first and does not propose redirects, aliases, or fallback paths.

## 0) Users Canon v1 (Locked)

### Canonical Routes (Current Worktree / Target)

| Route | Owner | Purpose |
|---|---|---|
| `/users` | `fireux-core` | Public user directory / collection |
| `/users/:handle` | `fireux-core` | Public user profile (handle-first) |
| `/dashboard/user-profile` | `fireux-core` (dashboard) | Private self-edit surface |
| `/dev/users` | `fireux-core` | Dev inspection / drift / collection tools |

Canon principle:
- Public identity is handle-first.
- Storage identity is uid-first.
- Dev/admin tooling does not live under public `/users/*`.

### Routes That Must Not Exist (Under This Canon)

- `/u/:handle` (removed alias; do not reintroduce)
- `/users/:uid` public UID route (ambiguous and leaks internal identity)
- `/users/id/:uid` fallback/internal route (removed by canon decision)
- `/users/admin/:id` (admin namespace must live under dashboard when/if added)
- redirect-only shims (none)

### Operational Truths (Locked From Now On)

- `fireux-core` owns `/users` and `/users/:handle`.
- Editing your own profile happens in dashboard only (`/dashboard/user-profile`).
- Dev tooling lives under `/dev/*` only (`/dev/users`, `/dev` overview).
- Public user UI surfaces never expose private fields (notably `email`).
- Components do not guess public UID routes:
  - if a handle route exists, link it
  - if no handle route exists, render non-clickable UI
- Handle normalization/validation/reserved-word checks are centralized before claim.
- Handle claim registry collection name is `handles` (canonical; do not rename without an explicit migration plan).

### Fallback Policy (Canon Enforcement)

This report follows a strict pre-ship canon rule:

- Do not patch gaps with runtime fallbacks.
- Do not add alias routes, redirect shims, or dual-path support.
- If data required by the canon is missing, surface the gap and fix the canon path directly.
- Migrations may read pre-canon shapes to transform data, but runtime code should not preserve pre-canon behavior.
- Never derive public fields from private/sensitive fields as a fallback (for example, do not derive `display_name` from `email`).

Required workflow when a gap is found:
1. State the missing invariant clearly.
2. Decide the canon.
3. Implement one canonical path.
4. Migrate existing data.
5. Delete old behavior.

## 1) Identity Decision: UID vs Handle as Firestore Doc ID

### Decision (Canon)

Keep Firestore core user doc id = Firebase Auth `uid`.

Keep handle as a public alias (stored on the user doc + indexed in a handle lookup collection).

### Why this is the right canon

- `uid` is stable and exists before profile setup.
- Handles can change; Firestore doc ids cannot be renamed cleanly.
- Security and ownership rules are simpler with `users/{uid}`.
- You still get clean public URLs via `/users/:handle`.

Do not use handle as the Firestore user doc id.

If you want a handle-first creation UX, do this instead:
1. create/ensure `/users/{uid}`
2. claim handle transactionally
3. route publicly by `/users/:handle`

## 2) Current Route Ownership and Behavior (Actual Code)

### Public routes

- `/users`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/pages/users/index.vue:1`
  - Collection page with `UserCTA` + `UserCollectionManager`
  - Uses global users collection (`useGlobalUserCollection`)

- `/users/:handle`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/pages/users/[handle].vue:1`
  - Normalizes route handle and replaces URL if needed: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/pages/users/[handle].vue:57`
  - Resolves handle -> uid -> user doc via `useUserByHandleFetch(...)`: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/pages/users/[handle].vue:54`
  - Shows `User not found` alert if handle is missing/unlinked: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/pages/users/[handle].vue:20`

### Dashboard / self-edit

- `/dashboard/user-profile`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue:1`
  - Self profile edit UI (not a public route)

### Dev

- `/dev/users`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/pages/dev/users.vue:1`
  - Model + drift + collection tooling

### Removed routes (confirmed canon)

- `/u/:handle` removed
- `/users/[id]` removed
- `/users/id/[uid]` removed
- `/users/admin/[id]` removed

## 3) Public Identity Resolution (Handle -> UID -> User)

### Canonical handle route lookup (current implementation)

`/users/:handle` resolves through a handle index, then loads the core user doc:

1. Normalize incoming route handle
2. Read handle record from `/handles/{handle}`
3. Extract `uid`
4. Read `/users/{uid}`

Implementation:
- Handle fetch composable: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts:12`
- Handle index read (`handles` collection): `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts:24`
- UID extraction from handle record: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts:46`
- Core user fetch by uid (`/users/{uid}`): `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts:51`

### Canonical public links (current implementation)

User cards now emit handle-only public links:
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts:37`

Rule:
- `to = /users/{handle}` when handle exists
- `to = ''` when no handle exists (non-clickable UI)

## 4) Handle Validation and Claim (Uniqueness)

### Reserved handles + normalization (centralized)

- Reserved handle set includes route-sensitive values (`users`, `u`, `apps`, `dev`, `dashboard`, `id`, etc.):
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/identity/useUserHandleIdentity.ts:1`
- Normalization (`@` strip, lowercase, spaces -> dashes, `[a-z0-9-]` only):
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/identity/useUserHandleIdentity.ts:25`
- Validation (min/max length + reserved check):
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/identity/useUserHandleIdentity.ts:40`

### Handle claim registry (Canon)

Current canonical handle index collection is:
- `handles`
- doc id = normalized handle
- record contains `uid` (and timestamps)

This name is canonical. Do not rename without an explicit migration plan.

### Handle claim (transactional, current implementation)

Claim path:
- `useCoreUserUpdate().profile.setHandle(...)` calls `claimHandle(...)`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/update/useCoreUserUpdate.ts:76`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/update/useCoreUserUpdate.ts:80`

Transactional behavior (good / keep):
- Reads `/users/{uid}`
- Checks `/handles/{nextHandle}`
- Rejects if claimed by another uid
- Writes/updates `/handles/{nextHandle}`
- Updates `users/{uid}` handle fields
- Deletes prior handle claim if owned by same uid

Implementation:
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts:25`

Note from draft cross-check:
- Draft proposed `user_handles/{handle}`.
- Current code already ships a working transactional `handles/{handle}` registry.
- Recommendation: keep `handles` for now (avoid churn) unless/until a planned migration is justified.

## 5) User Creation / Ensure (UID-First)

### Canonical current creation flow (actual runtime behavior)

When auth is ready on the client, FireUX auto-ensures the user exists:
- `useAuth()` creates `useUserEnsure()` once and calls `ensureUser()` after auth resolves
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firebase/useAuth.ts:171`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firebase/useAuth.ts:186`

`useUserEnsure().ensureUser()` then:
1. Ensures core doc `/users/{uid}`
2. Ensures app membership overlay `/apps/{appId}/users/{uid}`

Implementation:
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts:13`
- Core doc path read/write: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts:24`
- App overlay path read/write: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts:47`

Important canon detail:
- `users/{uid}` is created with `handle: ''` initially
  - handle is optional at creation time
  - public `/users/:handle` works only after handle claim

### Why this is correct

- Account identity exists immediately (`uid`)
- Public identity can be claimed later without rewriting the user doc id

## 6) Canon Deltas (Known Risks / Not Route Canon)

These do not change the route canon, but they matter for data-shape cleanliness.

### A) Generic stamp helpers still default to flat legacy fields (contained for active user writes)

`useFirestoreCreate().stampDoc(...)` and `useFirestoreUpdate().updateDocument(...)` still support flat legacy fields by default:
- `created_at`
- `updated_at`
- `creator_id` (when creator stamping is enabled)

Implementation:
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts:22`
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts:40`
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts:54`
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreUpdate.ts:8`

Impact:
- User creation/update paths now opt out with `legacyFlat: false`, but callers that do not opt out can still reintroduce flat fields.

### B) `useUserEnsure()` is read-then-set (acceptable today)

- Reads doc, then `setDocument(...)` if missing
- `setDocument(...)` is unconditional `setDoc(...)`
- Canon note: active user ensure writes now opt out of flat legacy stamps (`legacyFlat: false`)

Implementation:
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts:24`
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts:71`

Risk profile:
- Low for `users/{uid}` because uid comes from auth and path is self-owned
- Not a strong uniqueness claim primitive in general

### C) Dormant helper writes handles directly without handle-claim transaction (not currently used)

`ensureCoreUserDocument(...)` in `ensureHelpers.ts` generates/writes `handle` directly and does not claim `/handles/{handle}`.

Implementation:
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/ensureHelpers.ts:35`
- handle generation (`makeHandle`): `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/ensureHelpers.ts:256`

Current status:
- No runtime call sites found in `packages/` or `projects/` (repo-wide search)

Recommendation:
- Keep out of active flows (or remove later) unless rewritten to use canonical stamps + handle claim transaction.

## 7) Enforcement Checks (Repo Root)

```bash
# 1) Show all user page routes (packages + projects)
find packages projects -path "*pages/users*" -print

# 2) Prove no alias/fallback public routes exist
find packages projects -path "*pages/u*" -print
rg --files packages projects | rg '/pages/users/\\[id\\]\\.vue$|/pages/users/id/|/pages/users/admin/' || true

# 3) Prove handle routing is centralized + handle-only links remain
rg -n "normalizeUserHandle|validateUserHandleForPublicRoute|claimHandle\\(|useUserByHandleFetch\\(" \
  packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user -g '*.ts'
rg -n "to: handle \\? `/users/\\$\\{handle\\}` : ''" \
  packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts

# 4) Watch for pre-canon stamp writes in user creation/update paths
rg -n "creator_id|created_at|updated_at" \
  packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user \
  packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts -g '*.ts'
```

Expected results under this canon:
- Public user pages are `/users` and `/users/[handle].vue` only
- No `/u/*` routes
- No `/users/[id].vue`, `/users/id/*`, or `/users/admin/*` route files
- Handle route resolution goes through centralized normalization + claim/fetch utilities

## 8) Summary (What We Are Locking)

- Public routes are handle-first: `/users` + `/users/:handle`
- Storage identity is uid-first: `/users/{uid}`
- Public links are handle-only (no UID public fallback routes)
- Handle uniqueness is enforced via transactional claim on `handles/{handle}`
- Editing stays private (`/dashboard/user-profile`)
- Dev stays in dev (`/dev/users`)

Quick answer to the core question:
- Do not scrap `uid` as the user doc id.
- Keep `uid` for storage/security and use handle for public routing.
