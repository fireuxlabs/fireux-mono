<!--
source: user-tree.md (repo root)
imported: 2025-12-08
note: moved from repo root during doc cleanup
-->

# Firestore Core User Stack
Authority: Tier3 (Tooling/history)
Updated: 2026-03-02

`````
packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/
├─ useUser.ts                   # auth-aware orchestrator composing everything below
├─ main/
│  ├─ useUserFetch.ts           # subscribes to /users/{uid} and /apps/{appId}/users/{uid}
│  └─ useUserCollection.ts      # shared collection helpers for admin views, etc.
````markdown
# Firestore Core User Stack

`````

packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/
├─ useUser.ts # auth-aware orchestrator composing everything below
├─ main/
│ ├─ useUserFetch.ts # subscribes to /users/{uid} and /apps/{appId}/users/{uid}
│ └─ useUserCollection.ts # shared collection helpers for admin views, etc.
├─ core/
│ └─ useCoreUserEnsure.ts # provisions the CoreUser document and caches auth context
├─ app/
│ └─ useAppUserEnsure.ts # orchestrates CoreUser ensure + tenant membership ensure (exports useUserEnsure alias)
├─ mutations/
│ ├─ useCoreUserUpdate.ts # CoreUser writes (display name, avatar, tags, ecosystem notifications)
│ ├─ useAppUserUpdate.ts # AppUser writes (role, tenant notifications)
│ └─ useUserUpdate.ts # compatibility layer + `useUserUpdateForUid`
├─ state/
│ ├─ useUserComputed.ts # derived flags (isAdmin, CTA state, profile keys)
│ └─ useUserInterface.ts # UI-friendly shorthands for rendering user pills
├─ delete/
│ └─ useUserDelete.ts # destructive placeholder (stubbed delete flow)
└─ utils/
├─ ensureHelpers.ts # Firestore ensure helpers shared by core/app ensures
├─ useEnsureCommon.ts # guards such as `requireUid`
└─ forms/ # formatting + validation helpers (display name, avatar, etc.)

```

## Next steps

- Flesh out additional CoreUser/AppUser packs (details/tags/notifications, membership, etc.).
- Introduce explicit notification services once the shared API stabilizes.
- Document each pack’s contract in `STABLE_README.md` so new contributors can navigate the stack quickly.

# Firestore Core App Stack

```

packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/
├─ useApp.ts # orchestrator that composes fetch, state, ensures, mutations
├─ main/
│ ├─ useAppFetch.ts # subscribes to /apps/{appId}
│ └─ useAppCollection.ts # shared collection helper for admin/dev views
├─ core/
│ └─ useAppEnsure.ts # provisions the root app document + admin membership
├─ mutations/
│ └─ useAppUpdate.ts # handles profile/social updates and membership actions
├─ state/
│ ├─ useAppComputed.ts # derived flags (initialization, pending states)
│ └─ useAppInterface.ts # UI-friendly shorthands for pills/cells/profile cards
├─ subcollections/
│ └─ useAppUsers.ts # hydrates `/apps/{id}/users` membership docs
├─ delete/
│ └─ useAppDelete.ts # placeholder for cascade-aware deletions
└─ utils/
├─ useAppJoinRequests.ts # domain helpers for join queue moderation
├─ useEnvCheck.ts # onboarding env validation
└─ forms/
├─ useAppFormatting.ts # shared formatting helpers
└─ useAppValidation.ts # validation helpers for app forms

```

## Notes

- Layout now mirrors the user stack so newcomers can transfer mental models quickly.
- `delete/` is a stub for now; destructive workflows remain manual until cascade logic is defined.
- Add a `tenants/` pack later if `/apps` ever gains overlay documents.

```
