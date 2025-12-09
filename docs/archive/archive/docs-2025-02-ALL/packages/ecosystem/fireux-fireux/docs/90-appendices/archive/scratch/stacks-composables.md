# Stacks composables audit (canonical draft)

## Current blog vs user patterns

- **Blog**
  - Draft-first: `useCreateBlogPostState` stores full draft in local storage; publish once via `useBlogCreate`.
  - CRUD helpers: `useBlogCreate/Update/Delete/Posts`, UI: `useBlogInterface`, utilities: `useBlogPostUtils` (slug, reading time, author/default images).
  - No `ensure`; no incremental Firestore state; no Firestore-backed draft state.
- **User (core)**
  - Firestore-backed: `useUserFetch` + `useUser` for live refs; `useUserState` (Nuxt state) mirrors Firestore user for global access.
  - Has `ensure`, `update`, `delete`, `computed`, `interface` helpers; uses `useAuth` for UID resolution.

## Similarities and differences (table)

| Aspect       | Blog                                          | User                                                        | Products/Jobs                      | Chef/Supplier/Agent/Professional                                    |
| ------------ | --------------------------------------------- | ----------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| Data backing | Draft-first (local storage)                   | Live Firestore refs                                         | Live Firestore refs (no draft)     | Live Firestore refs + profile overlay                               |
| CRUD verbs   | create/update/delete/read (via useBlogPosts)  | ensure/create/update/delete                                 | create/update/delete               | ensure/create/update/delete                                         |
| Ensure       | No (one-shot publish)                         | Yes (scaffold if missing)                                   | No (publishable artifact)          | Yes (profiles)                                                      |
| State helper | Draft state (`useCreateBlogPostState`, local) | Global Nuxt state mirror (removed; use refs)                | None                               | None                                                                |
| UI helpers   | `useBlogInterface`                            | `useUserInterface`                                          | Product UI helpers (cards/prices)  | `use<Profile>Interface`                                             |
| Utilities    | Slug/reading time/author defaults             | Auth integration                                            | Pricing/slug, etc.                 | Profile formatting/validation                                       |
| Facade shape | `useBlogPosts()` aggregates CRUD + utils      | `useUser()` aggregates refs + computed + ensure + mutations | Varies (needs alignment to facade) | `use<Profile>()` aggregates refs + computed + interface + mutations |

---

## Directory snapshots (current)

```
fireux-blogs/src/runtime/composables/fireux/
├─ blog/                          # empty
└─ firestore/objects/Blog/
  ├─ state/useBlogInterface.ts
  ├─ useBlogCreate.ts
  ├─ useBlogDelete.ts
  ├─ useBlogPostUtils.ts
  ├─ useBlogPosts.ts
  ├─ useBlogUpdate.ts
  └─ useCreateBlogPostState.ts

fireux-products/src/runtime/composables/fireux/
└─ firestore/objects/Product/
  ├─ Prices/useCreatePricesState.ts
  ├─ utils/useProductFormatting.ts
  ├─ utils/useProductValidation.ts
  ├─ useCreateProductState.ts
  ├─ useProductCreate.ts
  ├─ useProductDelete.ts
  ├─ useProductUpdate.ts
  ├─ useProductUtils.ts
  └─ useProducts.ts

fireux-jobs/src/runtime/composables/fireux/
├─ app/
│  └─ routes/{useJobRoutes.ts,useJobDashboardRoutes.ts}
└─ firestore/
  ├─ jobs/main/{useJobCollection.ts,useJobCreate.ts,useJobDelete.ts,useJobEditor.ts,useJobRead.ts,useJobUpdate.ts}
  ├─ jobs/useJob.ts
  └─ profiles/{Agent,Professional}/main/* (collection/computed/create/delete/interface/update)

fireux-core/src/runtime/composables/fireux/firestore/
├─ core/
│  ├─ app/*
│  ├─ profile/*
│  └─ user/*
├─ operations/*
├─ state/{useAppState.ts,useProfileState.ts}
└─ utils/*

fireux-places/src/runtime/composables/
└─ (no fireux/ namespace) {usePlaceLogos.ts,usePlaceSave.ts,usePlaces.ts,usePlacesGoogle.ts,usePlacesSearch.ts}
```

---

## Stack comparison — entities and behaviour (today)

| Stack / Domain              | Where it lives (composables)                                   | Data backing                                           | Draft behaviour                                             | Ensure?                                                     | CRUD surface (current vibe)                          | State helper style                                             | UI / interface helpers                                    | Facade feel (today)                                     |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| Core User                   | core/fireux/firestore/core/user/\*                             | Live Firestore (core user + app user)                  | No draft – always mirrors Firestore                         | ✅ `useCoreUserEnsure` + `useAppUserEnsure`                 | `useUserUpdate`, core/app-specific mutations         | Firestore-backed (`useUserFetch`, prior `useUserState` mirror) | `useUserInterface`, `useUserComputed` (pill/cell/profile) | Strong: `useUser()` as main entry                       |
| Core App (tenant)           | core/fireux/firestore/core/app/\*                              | Live Firestore (/apps/{id} + membership)               | No draft (edit inline)                                      | ✅ `useAppEnsure`                                           | `useAppUpdate`, join-requests, admin toggle          | Firestore-backed (`useAppFetch`, computed state)               | `useAppInterface` (cards/cells), admin helpers            | Medium-strong: `useApp()`                               |
| Core Profile (generic)      | core/fireux/firestore/core/profile/\*                          | Live Firestore (core + tenant overlay)                 | No draft                                                    | ✅ `useProfileEnsure`                                       | `useProfileUpdate`                                   | Firestore-backed (`useProfileFetch`, computed)                 | `useProfileInterface`-style helpers                       | Medium: `useProfile()`                                  |
| Agent profile (Jobs)        | jobs/fireux/firestore/profiles/Agent/\*                        | Live Firestore (profile doc)                           | No draft                                                    | ✅ ensure-equivalent for profiles                           | Create/system + update in edit forms                 | Firestore-backed (profile sections)                            | Cards (Cell/Pill), Sections (Local/Global)                | Medium: `useAgent` used in pages                        |
| Professional profile (Jobs) | jobs/fireux/firestore/profiles/Professional/\*                 | Live Firestore                                         | No draft                                                    | ✅ same pattern as Agent                                    | Create/system + update                               | Firestore-backed                                               | Cards + Sections                                          | Medium: `useProfessional`-style                         |
| Chef profile (Misebox)      | misebox/fireux/firestore/profiles/Chef/\*                      | Live Firestore (profile)                               | No draft                                                    | ✅ ensure-like behaviour                                    | Create/system + update                               | Firestore-backed                                               | Cards + Sections (Local/Global)                           | Medium                                                  |
| Supplier profile (Misebox)  | misebox/fireux/firestore/profiles/Supplier/\*                  | Live Firestore                                         | No draft                                                    | ✅ ensure-like                                              | Create/system + update                               | Firestore-backed                                               | Cards + Sections                                          | Medium                                                  |
| BlogPost (Blogs)            | blogs/fireux/firestore/objects/Blog/_ + blogs/fireux/blog/_    | Firestore for published posts; local storage for draft | Draft-first: `useCreateBlogPostState` (local), then publish | ❌ No ensure (one-shot publish; slug uniqueness util-style) | `useBlogCreate/Update/Delete`, `useBlogPosts`        | Mixed: draft state (local) + Firestore reads                   | `useBlogInterface`, slug/reading-time helpers             | Fragmented: multiple entrypoints, no single `useBlog()` |
| Product (Products)          | products/fireux/firestore/objects/Product/\*                   | Live Firestore (product + prices)                      | No true draft – forms write to Firestore                    | ❌ No ensure (publishable artifact)                         | Create/System + update/delete helpers                | Firestore-backed (prices etc.)                                 | Pricing UI helpers (cards/prices)                         | Partial: more system than facade                        |
| Job (Jobs object)           | jobs/fireux/firestore/jobs/\*                                  | Live Firestore (job postings)                          | No draft – create system then write                         | ❌ No ensure (jobs are artifacts)                           | `objects/Job/Create/System.vue` + create composables | Firestore-backed reads/collections                             | Sections: AgentCollection, GlobalCollection               | Partial: job stack split between pages + sections       |
| Place (Places)              | places extension (mostly components; composables empty now)    | Live Firestore / query-based                           | No draft                                                    | ❌ No ensure (search/list only)                             | Read-only search/list                                | No dedicated state composable yet                              | UI components handle cards/search                         | Weak: no formal facade yet                              |
| Kitchen (Misebox)           | misebox/fireux/firestore/objects/Kitchen/\* (wizard + planned) | Intended Firestore-backed                              | Likely wizard-based draft → publish                         | Likely ❌ (artifact)                                        | `KitchenWizard.vue` + future CRUD                    | Will be mixed (draft + Firestore)                              | To come                                                   | Not fully defined yet                                   |
| Ingredient (Misebox)        | misebox/fireux/firestore/objects/Ingredient/\*                 | Live Firestore                                         | No draft (simple create/edit)                               | ❌ (artifact)                                               | Create/System + update                               | Firestore-backed                                               | Cards {Cell/Pill/Profile}                                 | Partial facade via create system                        |
| Recipe (Misebox)            | misebox/fireux/firestore/objects/Recipe/\*                     | Live Firestore                                         | Behaves like crafted content (could gain draft)             | ❌ currently                                                | Create/edit flows in components                      | Firestore-backed                                               | Cards (Pill)                                              | Early-stage                                             |

Rule of thumb

- Identity stacks (User/App/Profile/Agent/Professional/Chef/Supplier): have ensure and often overlays.
- Artifact stacks (Blog/Product/Job/Ingredient/Recipe): no ensure; they are complete artifacts.
- Query stacks (Places): read-only/search, may never mutate.

---

## Canon (minimal buckets) — use\* + fetch + mutations + utils (+ editor)

Per Firestore domain (`composables/fireux/firestore/<area>/<Domain>/`):

- `use<Domain>.ts` (facade)
  - Imports fetch + mutations + utils.
  - Exposes stable surface to pages: refs, pending, CRUD actions, view helpers.
- `fetch/`
  - Read-only helpers (queries/listeners).
  - Examples: `useBlogPosts`, `useProducts`, `useJobs`, `useBlogPost`, `useProductBySlug`.
- `mutations/`
  - Write-only helpers (create/update/delete/ensure).
  - Identity stacks: include `use<Domain>Ensure`.
  - Artifact stacks: no ensure; they are create/update/delete.
- `utils/`
  - Pure helpers, no Firestore: slug generation, reading-time, price formatting, status labels, etc.
  - Optional subdirs (when >1 file):
    - `view/` → interface/computed (`use<Domain>Interface`, `use<Domain>Computed`)
    - `validation/` → `use<Domain>Formatting`, `use<Domain>Validation`

Draft/editor (non-Firestore)

- Lives outside Firestore, alongside the domain: `composables/fireux/<domain>/use<Domain>DraftState.ts`, `use<Domain>Editor.ts`.
- Handles local draft state, stepper/wizard logic, and only calls mutations on publish.

---

## Extra classification: Identity vs Artifact vs Query

Identity stacks

- Examples: User, App, Profile, Agent, Professional, Chef, Supplier.
- Have ensure (mandatory), often core + app overlays, inline edit/partial update flows.
- Facade: `useUser()`, `useApp()`, `useProfile()`, `useAgent()`, etc.

Artifact stacks

- Examples: BlogPost, Product, Job, Ingredient, Recipe.
- No ensure.
- Created as complete artifacts via a form or wizard.
- Can be draft-backed (Blog/Recipe/Kitchen) or direct-write (Product/Job/Ingredient).
- Facade: `useBlog()`, `useProducts()`, `useJob()`, `useIngredient()`, etc.

Query stacks

- Example: Places (for now).
- Read/search only; no create/update in v1.
- Facade: `usePlaces()` (query & filter).

---

## Naming and placement conventions (refined)

- State vs draft
  - Firestore-backed mirrors (if re-added) live under `firestore/state/*` and are named `use<Domain>State`.
  - Draft-only buffers: `use<Domain>DraftState` or `use<Domain>Editor`, living under `composables/fireux/<domain>/` (not under firestore).
- CRUD surface
  - Consistent verbs: `use<Domain>Create`, `use<Domain>Update`, `use<Domain>Delete`, `use<Domain>Collection` / `use<Domain>Read` or `use<Domain>Posts` for lists.
  - `use<Domain>Ensure` only for identity/profile stacks.
- Aggregation wrappers (facades)
  - Each stack has exactly one main entry: `useUser()`, `useApp()`, `useProfile()`, `useBlog()`, `useProducts()`, `useJob()`.
  - Suggested facade shape:

```ts
const {
  items, // or item
  pending,
  error,
  create,
  update,
  remove,
  utils,
  view,
} = useBlog()
```

- Folder depth
  - Only introduce subfolders when there are ≥ 2 files: `view/` (if interface + computed), `validation/` (if formatting + validation). Otherwise keep files flat inside `utils/`.

---

## CTA + index-page pattern (for Jobs, Blog, Products)

Canonical layout for `/jobs`, `/blog`, `/products`:

```vue
<UPage>
  <UPageHeader
    :title="title"
    :description="description"
  />

  <UPageBody class="space-y-6">
    <!-- CTA -->
    <Organisms<Domain>CTA v-if="canCreate" />

    <!-- Loading -->
    <div v-if="pending" class="space-y-3">
      <USkeleton v-for="n in 3" :key="n" class="h-20" />
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="space-y-2 text-sm text-gray-500">
      <p>No {{ label }} found.</p>
      <p>{{ emptyHint }}</p>
    </div>

    <!-- List -->
    <Organisms<Domain>List v-else :items="items" />
  </UPageBody>
</UPage>
```

CTA components:

- `components/organisms/Blog/CTA.vue`
- `components/organisms/Product/CTA.vue`
- `components/Organisms/Jobs/CTA.vue`

Gate logic per CTA is derived from:

- `useUser().isAdmin` (Blog, Products)
- `useAgent()` (Jobs → hasAgentProfile)

---

## Level-1 filesystem rules for extensions

For each extension package:

```
packages/extensions/<ext-name>/src/runtime/composables/fireux/
├─ app/          # optional, extension-level app routing or dashboard routes
├─ firestore/
│  ├─ objects/   # artifact stacks (Blog, Product, Job, Ingredient, Recipe, etc.)
│  └─ profiles/  # identity stacks inside this extension (Agent, Professional, etc.)
└─ <domain>/     # optional non-Firestore helpers (editor, draft, UI state)
```

Examples:

- fireux-blogs
  - `fireux/blog/useBlogDraftState.ts`
  - `fireux/firestore/objects/Blog/*`
- fireux-products
  - `fireux/firestore/objects/Product/*`
- fireux-jobs
  - `fireux/firestore/objects/Job/*`
  - `fireux/firestore/profiles/Agent/*`
  - `fireux/firestore/profiles/Professional/*`

---

## Canonical checklist for a stack

- Facade: `use<Domain>()` or `use<Domain>Collection()` returning refs, pending, CRUD, view, utils.
- CRUD: `use<Domain>Create/Update/Delete` (+ Ensure for identity stacks).
- Interface/UI: `use<Domain>Interface` and optionally `use<Domain>Computed` under `utils/view/`.
- Validation: formatting + validation under `utils/validation/` when needed.
- Draft/editor: if needed, `use<Domain>DraftState` or `use<Domain>Editor` outside firestore.
- Naming: consistent verbs; no ambiguous “state” for drafts; no single-file subfolders unless grouping 2+ files.
- Index page: follows CTA + skeleton + empty + list pattern; CTA gating is explicit and derived from `useUser()` / profile facade.

---

If you want, next step we can pick one concrete stack (e.g. Blog) and map:

- current → target composable paths
- exact filename changes (no code changes yet, just FS shapes) — you get final say since you can see all the files.

---

## When adding a new stack (playbook)

When you introduce a new domain (e.g. Kitchen, Order, Booking, etc.), follow this sequence:

1. Classify the stack

- Is it Identity (needs ensure and overlays)?
- Is it an Artifact (complete document, no ensure)?
- Is it Query-only (search/list, no mutations)?
- This decides whether you add ensure and whether you need an editor/draft layer.

2. Create the composables root

```
packages/<core|ecosystem|extension>/<pkg>/src/runtime/composables/fireux/
└─ firestore/
   ├─ core/<Domain>/      # for shared core domains like User/App/Profile
   ├─ objects/<Domain>/   # for extension artifacts (Blog, Product, Job, etc.)
   └─ profiles/<Domain>/  # for extension profiles (Agent, Chef, etc.)
```

Pick one of: core, objects, or profiles.

3. Create the minimal canon for that domain

```
firestore/<area>/<Domain>/
├─ use<Domain>.ts          # facade
├─ fetch/
│  └─ use<Domain>Collection.ts / use<Domain>Read.ts
├─ mutations/
│  ├─ use<Domain>Create.ts
│  ├─ use<Domain>Update.ts
│  ├─ use<Domain>Delete.ts
│  └─ use<Domain>Ensure.ts   # only if Identity
└─ utils/
   ├─ view/                  # optional
   │  ├─ use<Domain>Interface.ts
   │  └─ use<Domain>Computed.ts
   └─ validation/            # optional
      ├─ use<Domain>Formatting.ts
      └─ use<Domain>Validation.ts
```

- Identity stacks: must have `use<Domain>Ensure.ts`.
- Artifact stacks: never have ensure, but may have an editor.

4. Add an editor/draft layer if needed

If the domain is “crafted content” (Blog, Recipe, Kitchen wizard):

```
composables/fireux/<domain>/
├─ use<Domain>DraftState.ts
└─ use<Domain>Editor.ts
```

- Draft state is local only (Pinia, `useState`, or localStorage).
- Editor is allowed to be opinionated (steps, preview, etc.) and only calls mutations on publish.

5. Expose one facade

In `use<Domain>.ts`, always export a single, predictable surface:

```ts
export function useBlog() {
  const { items, item, pending, error } = useBlogPostsFetch()
  const { create, update, remove } = useBlogMutations()
  const { utils, view } = useBlogHelpers()

  return {
    items,
    item,
    pending,
    error,
    create,
    update,
    remove,
    utils,
    view,
  }
}
```

Pages and components should only import the facade (`useBlog`, `useProducts`, `useJob`, `useAgent`, etc.) unless there’s a very specific reason.

6. Wire the index page with CTA canon

- Use the canonical layout (CTA + skeleton + empty + list).
- Pick the gate source:
  - `useUser().isAdmin` → admin-only CTAs (Blog, Products).
  - `useAgent()` / `useChef()` → profile-based CTAs (Jobs, Chef dashboards).
- Keep the shape consistent so the UX feels the same across stacks.

---

## Quick Copilot summary (drop-in prompt)

FireUX composables canon — TL;DR for Copilot

- Every domain lives under `composables/fireux/firestore/<area>/<Domain>/`.
- `<area>` is:
  - `core` for shared core (User, App, Profile),
  - `objects` for artifacts (Blog, Product, Job, Ingredient, Recipe),
  - `profiles` for extension profiles (Agent, Professional, Chef, Supplier).
- Inside each `<Domain>` folder:
  - `use<Domain>.ts` is the facade (only thing pages should normally import).
  - `fetch/` holds read-only helpers (`use<Domain>Collection`, `use<Domain>Read`).
  - `mutations/` holds write helpers (`use<Domain>Create/Update/Delete` and optionally `use<Domain>Ensure` for identity stacks).
  - `utils/` holds pure helpers (no Firestore), optionally split into:
    - `view/` → `use<Domain>Interface`, `use<Domain>Computed`
    - `validation/` → `use<Domain>Formatting`, `use<Domain>Validation`
- Draft/editor logic must not live under firestore. It goes in `composables/fireux/<domain>/use<Domain>DraftState.ts` and/or `use<Domain>Editor.ts`.
- Identity stacks (User/App/Profile/Agent/Professional/Chef/Supplier) must have ensure.
- Artifact stacks (Blog/Product/Job/Ingredient/Recipe) never have ensure, but may have editor/draft.
- Index pages for artifact stacks (Jobs, Blog, Products) follow the same pattern:
  - CTA (gated by `useUser().isAdmin` or profile facade),
  - loading skeleton (`USkeleton`),
  - empty state,
  - list component.
