# Places Stack vs “Starter Stack” (FireUX)

Date: 2025-12-29

Purpose: Blog/Products are evolving, so this doc compares Places against a broader sample (Companies + Misebox ecosystem objects) and then defines a **starter object stack template** (an “imaginary canon”) that we can standardize on.

---

## Observed stacks in this repo (not treated as final)

### Companies (clean facade; minimal but consistent)

- Facade:
  - `packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/useCompanies.ts`
- Fetch:
  - `.../company/fetch/useCompanyFetch.ts` → `{ companies, company }`
- Mutations:
  - `.../company/mutations/useCompanyCreate.ts`
  - `.../company/mutations/useCompanyUpdate.ts`

Useful bits:
- Facade composes fetch + mutations.
- Doesn’t over-abstract; keeps surface area small.

### Misebox ecosystem objects (pragmatic; direct vuefire)

- Ingredient:
  - `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredient.ts`
  - Uses `vuefire` `useCollection/useDocument` directly, has SSR keys, includes normalization.
  - Also has a pure “domain helper” composable `useIngredientFilters.ts`.

- Recipes:
  - `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/recipe/useRecipes.ts`
  - Similar: direct `vuefire`, returns `{ all, pending, error }` plus CRUD composables.

Useful bits:
- Clear separation between “fetching” and “domain helper” (filters).
- Returns a standard trio `{ data, pending, error }` that pages/components can depend on.
- Uses SSR keys deliberately.

### Blog/Products (examples only)

- They show patterns we like (facade + `utils/view/*Interface.ts`, split fetch), but we do **not** treat them as final canon.

---

## Starter stack template (proposed canon)

This is the **starter stack** you proposed. We can assume this shape for new things and then *omit optional parts* when an object doesn’t need them.

```
src/runtime/
  models/
    objects/
      <Object>.model.ts

  composables/
    fireux/
      firestore/
        objects/
          <object>/
            use<Objects>.ts

            fetch/
              use<Object>Collection.ts
              use<Object>Read.ts
              use<Object>Search.ts

            mutations/
              use<Object>Create.ts
              use<Object>Update.ts
              use<Object>Delete.ts

            state/
              use<Object>DraftState.ts
              use<Object>CreateSubmit.ts
              use<Object>UpdateSubmit.ts

            view/
              use<Object>Interface.ts

  components/
    organisms/
      objects/
        <Object>/
          CTA.vue

          List.vue
          Profile.vue

          Cards/
            Pill.vue
            Cell.vue
            Profile.vue

          Sections/
            GlobalCollection.vue
            LocalCollection.vue

          Create/
            System.vue
            Write.vue
            Preview.vue

          Edit/
            System.vue
            Core.vue
            App.vue
            Preview.vue
```

### Starter rules (required vs optional)

Required (baseline):
- `use<Objects>.ts` is the entry point.
- `fetch/use<Object>Collection.ts` exists (even if it’s tiny).
- `mutations/` exists if the object is editable.
- `view/use<Object>Interface.ts` exists when there are UI cards/cells; components import UI shapes from here (not from models).

Optional (only when needed):
- `fetch/use<Object>Read.ts` (only if you have a single-doc page or doc-level reads).
- `fetch/use<Object>Search.ts` (only if search exists).
- `state/` (only if create/edit UX is multi-step or needs draft state).
- `Sections/GlobalCollection.vue` + `LocalCollection.vue` (only if tenant/global duality exists).
- `Edit/Core.vue` + `Edit/App.vue` (only if the data model truly has split write scopes).

Placement rules:
- `models/objects/<Object>.model.ts` is *data shape* only.
- `view/use<Object>Interface.ts` is UI shape + mapping only (no firestore/network).
- Provider integrations (Google, Stripe, etc.) live under `fetch/<provider>/...` while they’re domain-owned.
- Prefer consistent fetch outputs: `items|collection`, `pending`, `error`.

---

## Places vs the proposed starter stack

### Current Places stack (mapped to the starter shape)

Repo paths today (FireUX mono conventions):
- Data model (not yet under `models/objects/`):
  - `packages/extensions/fireux-places/src/runtime/models/place.model.ts`
- Entry point:
  - `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/usePlaces.ts`
- Fetch:
  - `.../place/fetch/usePlaceCollection.ts` (collectionPath + collection + count)
  - `.../place/fetch/search/usePlacesSearch.ts` (search orchestration)
  - `.../place/fetch/google/usePlacesGoogle.ts` (provider fetch)
- Mutations:
  - `.../place/mutations/usePlaceCreate.ts`
  - `.../place/mutations/usePlaceSave.ts`
- View:
  - `.../place/utils/view/usePlacesInterface.ts` (UI shapes + `toCell()`)
  - `.../place/utils/view/usePlaceLogos.ts` (logo hydration)
- Domain utils:
  - `.../place/utils/placeCollections.ts` (runtimeConfig types → collection mapping)

### Alignment status vs starter

- ✅ Entry point exists at object root (`usePlaces.ts`).
- ✅ Fetch/mutations/view layers exist.
- ✅ UI components can import UI shapes/mappers from `view/usePlacesInterface.ts`.

Gaps (against the starter stack):
- ⚠️ Model placement: Places uses `runtime/models/place.model.ts`; starter wants `runtime/models/objects/Place.model.ts`.
- ⚠️ Model contents: `place.model.ts` still includes UI-ish types/mappers (`PlaceCard`, `toCell`). Starter wants those only in `view/use<Object>Interface.ts`.
- ⚠️ Fetch shape: `usePlaceCollection` returns `collection` (possibly `undefined`) and `count`, but does not expose a first-class `pending` + `error` pair like Misebox’s patterns.
- ⚠️ Naming: we currently use `utils/view/usePlacesInterface.ts` rather than `view/usePlaceInterface.ts` directly under the object. Starter template puts `view/` alongside `fetch/` and `mutations/`.

Notes:
- The repo’s existing canon also uses `utils/view/` in some stacks. Your starter template prefers `view/` at the same level as `fetch/`.
- If we adopt your starter template, we should normalize future objects to `objects/<object>/view/` (and keep a small compatibility window while we migrate older stacks).

---

## Decision point: where should Google Places logic live?

Starter default:
- Keep it domain-owned under `objects/place/fetch/google/*`.

Only elevate to `composables/fireux/integrations/google/places/*` if:
- 2+ non-Place domains need to import the integration client directly.

---

## Next steps to converge Places to the starter stack

1) Make fetch shape consistent
- Add `pending` + `error` style outputs for `usePlaceCollection` (even if `error` is null for now).

2) Continue UI interface migration
- Any UI component needing Place card/cell shapes should import from `utils/view/usePlacesInterface`.

3) Optional: add a thin fetch facade
- `fetch/usePlaceFetch.ts` (if we want a single fetch entry like Company/Blog).
