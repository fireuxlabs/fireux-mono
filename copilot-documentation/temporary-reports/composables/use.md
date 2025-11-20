# Profile `use*` Facades (2025-11-15)

Quick comparison of the four profile composables to confirm their public APIs stay aligned.

## Shared Shape

- All call `useProfile()` with their domain-specific `*Config` and expose the underlying `profile`, `coreProfile`, `appProfile`, and `pending` refs.
- `use*Computed(refs, pending)` now shares a single signature that simply returns `{ profile: refs, pending }` until domain-specific derived state is added.
- `use*Interface(refs[, coreUser])` still owns the UI-ready helpers (`pill`, `cell`, `profile`) surfaced via computed values or getter functions.
- `use*Update(refs)` exists for every domain (Chef, Agent, Professional, Supplier) and is spread back into the return payload for caller convenience.

## Composable Snapshot

| Composable        | File                                                                                                         | Extra Dependencies                               | Returned Keys                                                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useProfessional` | `packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessional.ts` | `useUser()` for `coreUser` (passed to interface) | `profile`, `coreProfile`, `appProfile`, `pending`, `profile`+`pending` from computed, UI helpers (`pill`, `cell`, `profileCore`, `profileApp`), update helpers (`updateCoreProfessional`, `updateAppProfessional`, `setRelevantExperience`, `setOtherExperience`) |
| `useAgent`     | `packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgent.ts`         | none beyond core profile stack                   | `profile`, `coreProfile`, `appProfile`, `pending`, computed passthrough, UI helpers (`pillProps`, `cellProps`, `profileProps`), update helpers                                                                                                                    |
| `useChef`         | `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChef.ts`                 | none beyond core profile stack                   | `profile`, `coreProfile`, `appProfile`, `pending`, computed passthrough, UI helpers, update helpers                                                                                                                                                               |
| `useSupplier`     | `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplier.ts`         | none beyond core profile stack                   | `profile`, `coreProfile`, `appProfile`, `pending`, computed passthrough, UI helpers, update helpers                                                                                                                                                               |

## Alignment Notes

- **Computed parity**: All four composables now spread `{ profile, pending }` from their computed helper, matching the Professional variant.
- **Update helpers**: `useProfessional()` now imports and spreads `useProfessionalUpdate(refs)`, bringing it in line with the other domains.
- **UI helpers**: Professional continues to inject `coreUser` into its interface builder because it derives pills from canonical user data; other domains rely solely on profile documents. This difference is intentional and documented here for future audits.
- **Next review hook**: When adding derived state (e.g., status flags, filtered listings), drop the logic into the shared computed helper to keep the facade signature stable.
