# Firestore Core User Stack

```
packages/core/fireux-core/src/runtime/composables/firestore/core/user/
├─ useUser.ts                   # auth-aware orchestrator composing everything below
├─ main/
│  ├─ useUserFetch.ts           # subscribes to /users/{uid} and /apps/{appId}/users/{uid}
│  └─ useUserCollection.ts      # shared collection helpers for admin views, etc.
├─ core/
│  └─ useCoreUserEnsure.ts      # provisions the CoreUser document and caches auth context
├─ app/
│  └─ useAppUserEnsure.ts       # orchestrates CoreUser ensure + tenant membership ensure (exports useUserEnsure alias)
├─ mutations/
│  ├─ useCoreUserUpdate.ts      # CoreUser writes (display name, avatar, tags, ecosystem notifications)
│  ├─ useAppUserUpdate.ts       # AppUser writes (role, tenant notifications)
│  └─ useUserUpdate.ts          # compatibility layer + `useUserUpdateForUid`
├─ state/
│  ├─ useUserComputed.ts        # derived flags (isAdmin, CTA state, profile keys)
│  └─ useUserInterface.ts       # UI-friendly shorthands for rendering user pills
├─ delete/
│  └─ useUserDelete.ts          # destructive placeholder (stubbed delete flow)
└─ utils/
   ├─ ensureHelpers.ts          # Firestore ensure helpers shared by core/app ensures
   ├─ useEnsureCommon.ts        # guards such as `requireUid`
   └─ forms/                    # formatting + validation helpers (display name, avatar, etc.)
```

## Next steps

- Flesh out additional CoreUser/AppUser packs (details/tags/notifications, membership, etc.).
- Introduce explicit notification services once the shared API stabilizes.
- Document each pack’s contract in `STABLE_README.md` so new contributors can navigate the stack quickly.
