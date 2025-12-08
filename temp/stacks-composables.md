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

> Artifact stacks (Blog, Product, Job, Ingredient, Recipe) do not ensure; identity/profile stacks do. Blog is the outlier with a clear draft layer atop Firestore reads. Places is read-focused and wants a `usePlaces()` facade.

## Canon (minimal buckets) — use\* + fetch + mutations + utils (+ editor)

- **Root shape per Firestore domain** (`composables/fireux/firestore/<area>/<Domain>/`)
  - `use<Domain>.ts` (facade): imports fetch + mutations + utils, exposes refs/pending/error and mutations.
  - `fetch/`: read-only helpers (aka queries). Keep existing `use*Fetch` here (e.g., `fetch/useUserFetch.ts`, `fetch/useBlogPostsFetch.ts`).
  - `mutations/`: writes (modern CRUD). `useCreate<Domain>`, `useUpdate<Domain>`, `useDelete<Domain>`, plus `useEnsure<Domain>` for identity-ish stacks only.
  - `utils/`: pure helpers (slug, formatting, validation, status labels). No Firestore, no Vue state.
- **Draft/editor (non-Firestore)** stays outside Firestore namespace:
  - `composables/fireux/<domain>/use<Domain>Editor.ts` (blog/job/product/kitchen as applicable). Editor builds local draft and calls mutations on publish.
- **Brain hooks**
  - Read ≠ write: `fetch/` is reads, `mutations/` is writes.
  - Facade is the only import surface for pages/components; direct fetch/mutation imports are exceptional.
  - Identity/profile stacks get `ensure` inside `mutations/`; artifact stacks do not.

## Naming and placement conventions (proposed)

- **State vs draft**
  - Firestore-backed mirrors live under `firestore/state/*` (e.g., `useUserState`), naming implies live sync.
  - Draft-only/local buffers live beside their domain (e.g., blog) and should be named `use<Domain>DraftState` to avoid implying live sync.
- **CRUD surface**
  - Prefer consistent verbs: `use<Domain>Create`, `use<Domain>Update`, `use<Domain>Delete`, `use<Domain>Read`/`use<Domain>Collection` (or `use<Domain>Posts` wrapper that aggregates read + CRUD helpers).
  - Add `use<Domain>Ensure` only when partial/ensure flows exist (profiles/users), not for one-shot publish flows (blog/product).
- **Aggregation wrappers**
  - Provide a facade (e.g., `use<Domain>()` or `use<Domain>Posts()`) that returns refs + helpers in a stable shape: `{ refs, pending, create, update, delete, utils, interface }`.
- **File location**
  - Domain-specific composables stay under `.../composables/fireux/firestore/objects/<Domain>/` (or profiles/jobs/products/etc.).
  - Core/global helpers stay under `.../composables/fireux/firestore/core/<domain>/` (e.g., user/app/profile) to distinguish shared primitives from extension-specific logic.
- **Folder depth**
  - Avoid single-file subfolders; group when there are ≥2 related files (`state/`, `mutations/`, `delete/`, `app/`) or flatten with prefixed filenames if only one.

## Gaps/opportunities

- Blog: rename `useCreateBlogPostState` to `useBlogDraftState` for clarity; optionally add a lightweight `useBlogEnsure` (slug uniqueness/defaults) if parity with ensure-pattern stacks is desired.
- User: consider flattening tiny single-file subfolders (state/app/mutations/delete) or prefixing filenames to reduce depth while keeping separation.
- Products/Jobs/Chef/Supplier: verify CRUD naming consistency and presence of an aggregated facade per stack.

## Canonical checklist for a stack

- [ ] Facade: `use<Domain>()` or `use<Domain>Collection()` returning refs, pending, CRUD, interface, utils.
- [ ] CRUD: `use<Domain>Create/Update/Delete` (and Read/Collection if not wrapped).
- [ ] Ensure (optional): only when partial scaffolding is supported.
- [ ] Interface/UI: `use<Domain>Interface` (pill/cell/profile builders); `use<Domain>Computed` for derived state.
- [ ] State: Firestore-backed global mirrors named `use<Domain>State`; draft-only buffers named `use<Domain>DraftState` and colocated with the domain.
- [ ] Naming: stable verbs, no ambiguous “state” for drafts, no single-file folders unless grouping 2+ files.
