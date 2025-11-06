# User Stack – Frozen (Stable)

Baseline (Nov 2025):

- `useUserFetch` returns raw refs `{ coreUser, appUser }` (no computed merge).
- `useUser()` returns the grouped refs as `user` (same `{ coreUser, appUser }`) and fans those into `useUserComputed`, `useUserEnsure`, `useUserUpdate`, `useUserDelete`.
- `useUserComputed()` exposes `currentUser` plus `hasCoreProfile`/`hasAppProfile` flags (no pill mapping).
- `useUserUpdate()` takes the grouped refs and exposes `updateDisplayName` and `updateAppRole`, updating the respective core/app documents when ids exist.
- Downstream helpers (`useUserEnsure`, `useUserDelete`) keep accepting the raw grouped refs.

Only change this stack when a concrete feature requires it or a type error blocks builds. Otherwise treat this layout as the stable contract.
