# Firestore Core Composables – Proposed Structure

```
packages/core/fireux-core/src/runtime/composables/firestore/core/
├─ app/
│  ├─ useApp.ts                         # public entry point (app + helpers)
│  ├─ main/
│  │  ├─ useAppCollection.ts            # lightweight collection accessor
│  │  ├─ useAppComputed.ts              # derived flags, pill props, etc.
│  │  ├─ useAppEnsure.ts                # create/ensure the app record
│  │  ├─ useAppUpdate.ts                # mutation helpers for app metadata
│  │  └─ useAppFetch.ts                 # reactive single-doc fetch
│  ├─ subcollections/
│  │  └─ useAppUsers.ts                 # merged /apps/{id}/users overlay helper
│  └─ utils/
│     ├─ forms/
│     │  ├─ useAppFormatting.ts
│     │  ├─ useAppJoinRequests.ts
│     │  └─ useAppValidation.ts
│     └─ useEnvCheck.ts
|
└─ user/
   ├─ useUser.ts                        # public entry: aggregates everything below
   ├─ main/
   │  ├─ useUserCollection.ts           # merged core + tenant overlay collection reader
   │  ├─ useUserComputed.ts             # derived state (admin flags, pill props, etc.)
   │  ├─ useUserEnsure.ts               # ensure core + tenant overlay docs
   │  ├─ useUserUpdate.ts               # mutation helpers (profile, email, avatar)
   │  ├─ useUserFetch.ts                # reactive core-user doc fetch
   │  └─ useUserDelete.ts               # deletion stub (kept for parity / future work)
   └─ utils/
      └─ forms/
         └─ useUserFormattingAndValidation.ts # form helpers & validators
```

## Notes

- `useUser.ts` mirrors `useApp.ts` by serving as the single import surface while delegating to collection helpers, computed helpers, ensure/update modules, etc.
- User deletion remains a client concern, so `useUserDelete.ts` sits in `main/` while app deletion happens server-side.
- Overlay mapping logic lives in `utils/mapOverlayToUser.ts`, keeping collection/accessor modules lean and reusable.
- Additional helpers (formatting, validation, delete stub) remain alongside the new folders so they stay discoverable without deep nesting.
- The structure keeps the "public" API files (`useApp.ts`, `useUser.ts`) flat at the top level, with supporting concerns grouped inside `main/`, `subcollections/`, and `utils/` for parity between app and user domains.
