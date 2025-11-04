# User Stack – Frozen (Stable)

Current baseline is **good**:

- `useUserFetch` returns `{ coreUser, appUser }`
- `useUser()` distributes this object to `useUserComputed`, `useUserEnsure`, `useUserUpdate`, `useUserDelete`
- No computed merge or overlay logic

**Do not refactor further** unless:

- A new feature truly requires it
- Type errors appear that block builds

Treat this as the reference state when working on the user composables.
