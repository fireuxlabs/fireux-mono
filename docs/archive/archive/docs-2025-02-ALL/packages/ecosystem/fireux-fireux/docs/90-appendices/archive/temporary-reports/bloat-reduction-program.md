# Bloat Reduction Program (Fetch Composables)

## Goals

- Keep every `use*Fetch` composable predictable: single exit path, no wrapper refs, clear null semantics.
- Share mental model across auth, user, profile, and future domain fetchers so devs can reason about data flow quickly.
- Preserve tenant overlay behaviour (core + optional app doc) while limiting boilerplate and runtime watchers.

## Current Snapshot

- **useUserFetch**: accepts `string | null | undefined`, spins core + app listeners, returns grouped refs `{ coreUser, appUser }` with no merge.
- **useProfileFetch**: same grouped-ref contract, driven by collection config; attach/merge happens in a dedicated computed helper.
- **useAppFetch**: single-doc listener guarded by nullable id; no extra computed layer.
- Other fetchers (chef, supplier, agent, etc.) wrap `useProfileFetch` generics—benefit automatically once base stays lean.

## Bloat Smells To Watch

- `isRef`/`ref` wrappers around ids when callers already pass reactive refs.
- Recomputing document refs via nested `computed` blocks—Vuefire accepts factory functions directly.
- Spreading app overlays multiple times or mutating optional fields inline.
- Inconsistent null handling (returning `undefined`, partials, or throwing).

## Action Plan

1. **Baseline Contracts** (done for user/profile)
   - Inputs stay as simple primitives; upstream composables supply `.value` when necessary.
   - Guard `if (!id)` with instant `computed(() => null)` to avoid downstream `undefined` checks.
2. **Normalize Tenant Overlay**
   - Always call `useDocument` with either doc ref or `null` (no extra refs).
   - Merge overlays via shallow spread once, default to `{}`.
   - Reserve user attachment for profile-level fetchers only.
3. **Audit Remaining Fetchers**
   - `useAppFetch`, `useChefFetch`, etc.: drop reactive id juggling, confirm they reuse core patterns.
   - Ensure generics remain intact (e.g., `TProfile extends Profile`).
4. **Testing/Verification**
   - Type-check `packages/core/fireux-core` after each refactor; known unrelated errors documented (app pill avatar, env-check imports).
   - Manual smoke on `/dev/fireux-jobs` to confirm no flicker, overlays merge correctly.
5. **Documentation & Snippets**
   - Add template snippet for new fetchers (core doc + optional overlay + computed return) in `copilot-instructions` if we expand pattern.

## Open Questions

- Should `useProfile` expose the auth-derived id or accept overrides for admin tooling?
- Do we need a shared helper (`createOverlayFetch`) to avoid repeated copy-paste when new domains arrive?
- How do we handle real-time detach when auth signs out mid-stream (currently returns null via computed but worth explicit tests)?

## Next Steps

- [ ] Apply the simplified pattern to remaining composables flagged during audit.
- [ ] Decide whether to consolidate minimal `user` attachment in a helper to avoid duplication across profile variants.
- [ ] Revisit `useAppComputed` avatar typing error once we address fetch clean-up, to keep typecheck green.
