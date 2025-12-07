# User Stack – Frozen (Stable)

Baseline (Nov 2025):

- `useUserFetch` returns raw refs `{ coreUser, appUser }` (no computed merge).
- `useUser()` returns the grouped refs as `user` (same `{ coreUser, appUser }`) and fans those into `useUserComputed`, `useUserEnsure`, `useUserUpdate`, `useUserDelete`.
- `useUserComputed()` exposes `currentUser` plus `hasCoreProfile`/`hasAppProfile` flags (no pill mapping).
- `useUserUpdate()` returns grouped actions `{ core.profile, core.tags, core.notifications, app.membership, app.notifications }` so callers intentionally opt into the capability they need (no flat aliases).
- Downstream helpers (`useUserEnsure`, `useUserDelete`) keep accepting the raw grouped refs.

Only change this stack when a concrete feature requires it or a type error blocks builds. Otherwise treat this layout as the stable contract.
