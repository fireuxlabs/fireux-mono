# Experience ↔︎ Places Reconciliation

Context: `copilot-documentation/experience-stack.md` captures the jobs experience flow, while `copilot-documentation/places-stack.md` snapshots the core Places UI and composables.

## Shared Building Blocks

- Both stacks lean on `usePlacesSearchVm`, `usePlaceSave`, and `usePlacesGoogle` for canonical IDs, Google autocomplete, and Firestore persistence.
- Logo handling flows through `usePlaceLogoState` (`usePlaceLogos.ts`), ensuring consistent avatar fetching and retry behavior for selected places and saved cells.
- UI primitives (`OrganismsPlacesSearchBar`, `OrganismsPlacesSearchDropdown`, `OrganismsPlacesCell`) surface in both Create.vue and dedicated Places pages, providing consistent shortlist rendering.

## Divergences & Duplications

- Experience `Create.vue` reimplements confirm + fallback logic that closely mirrors `Search/Section.vue`. The main difference is how the confirmed event is shaped for experience emission.
- Experience resets form fields manually, whereas Places `Section.vue` just clears selection/query; both duplicate canonical ID validation & fallback creation utilities.
- `Create.vue` duplicates short address and avatar sanitation helpers that already exist conceptually in `places-stack` (e.g., `sanitizeLogoAvatar`, `extractDomain`) but with different naming and scope.
- Error and success toasts are handled locally in each component, resulting in inconsistent copy (`Place saved to Firestore.` vs `Sign in to save places.` timing logic).

## Alignment Opportunities

- Extract a shared confirmation utility (e.g., `confirmPlaceSelection()` composable) that returns `{ canonicalId, storedPlace }`, allowing both stacks to plug in bespoke side effects without duplicating Firestore fallback logic.
- Consolidate string sanitation / short address helpers into a reusable module under `fireux-places/runtime` to avoid divergence in formatting rules.
- Normalize success/error messaging via shared constants to keep UX copy aligned across Experiences, Places list, and any future tenant surfaces.
- Consider exposing the new shared logic through `usePlacesSearchVm` (returning `confirmSelection`, `reset`) so `Create.vue` can drop bespoke watchers and timers, simplifying the component.

## Next Steps

1. Add ADR or design note for unifying place confirmation, covering authentication requirements and Firestore collision handling.
2. Audit remaining consumers (tenants, other Organisms) to ensure they point at the new shared helpers once extracted.
3. Update unit/interaction tests to cover the shared confirmation path, validating both manual save and auto-save flows.
