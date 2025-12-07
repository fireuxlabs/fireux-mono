# Index/CTA alignment — jobs, blog, products

## Repo-wide organisms tree (all packages)

```
packages/core/fireux-core/src/runtime/components/organisms/
├─ App/
│  ├─ Cards/{Cell.vue,Pill.vue,Profile.vue}
│  ├─ Collection.vue
│  ├─ Edit/{App.vue,Core.vue}
│  └─ Preview.vue
├─ Auth/{Authenticated.vue,Email.vue,EmailPanel.vue,Google.vue,System.vue}
├─ Dashboard/Profile/Edit/Profile.vue
├─ Profile/{Root.vue,Page.vue,List.vue,Sections/Single.vue}
└─ User/
  ├─ Cards/{Cell.vue,Pill.vue,Profile.vue}
  ├─ CTA.vue
  ├─ Collection.vue
  ├─ Edit/{App.vue,Core.vue,Preview.vue}
  └─ Preview.vue

packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/
├─ CTA.vue
├─ List.vue
├─ Cards/{Article.vue,Cell.vue,Page.vue,Product.vue}
├─ objects/Post/Create/System.vue
└─ Create/{System.vue,Write.vue,Preview.vue,Advanced.vue,Images.vue}

packages/extensions/fireux-products/src/runtime/components/organisms/Product/
├─ CTA.vue
├─ Cards/{List.vue,Prices.vue,Product.vue}
└─ Create/{System.vue,Basic.vue,Write.vue,Preview.vue,Price.vue,Prices.vue,Stock.vue}

packages/extensions/fireux-places/src/runtime/components/organisms/places/
├─ Cell.vue
├─ List.vue
└─ Search/{Bar.vue,Dropdown.vue,Section.vue,Selected.vue}

packages/extensions/fireux-jobs/src/runtime/components/Organisms/
├─ Jobs/{CTA.vue,Create.vue,Sections/{AgentCollection.vue,GlobalCollection.vue}}
├─ objects/Job/Create/System.vue
└─ profiles/
  ├─ Agent/
  │  ├─ Cards/{Cell.vue,Pill.vue}
  │  ├─ CTA.vue
  │  ├─ Create/System.vue
  │  ├─ Edit/{App.vue,Core.vue,Preview.vue}
  │  ├─ Profile.vue
  │  ├─ Preview.vue
  │  └─ Sections/{GlobalCollection.vue,LocalCollection.vue}
  ├─ Professional/
  │  ├─ Cards/{Cell.vue,Pill.vue}
  │  ├─ CTA.vue
   │  ├─ Create/System.vue
  │  ├─ Edit/{App.vue,Core.vue,Preview.vue}
  │  ├─ Profile.vue
  │  ├─ Preview.vue
  │  └─ Sections/{GlobalCollection.vue,LocalCollection.vue}
  └─ shared/professional/
    ├─ CertificationSection.vue
    ├─ EducationSection.vue
    ├─ ExperienceSection.vue
    ├─ ProjectSection.vue
    └─ VolunteerSection.vue

packages/ecosystem/fireux-misebox/src/runtime/components/organisms/
├─ Kitchen/KitchenWizard.vue
├─ objects/
│  ├─ Ingredient/{Profile.vue,Edit.vue,Create/System.vue,Cards/{Cell.vue,Pill.vue,Profile.vue}}
│  └─ Recipe/Cards/Pill.vue
├─ profiles/
│  ├─ Chef/
│  │  ├─ Cards/{Cell.vue,Pill.vue}
│  │  ├─ CTA.vue
│  │  ├─ Create/System.vue
│  │  ├─ Edit/{App.vue,Core.vue,Preview.vue}
│  │  ├─ Preview.vue
│  │  ├─ Profile.vue
│  │  └─ Sections/{LocalCollection.vue,GlobalCollection.vue}
│  ├─ Supplier/
│  │  ├─ Cards/{Cell.vue,Pill.vue}
│  │  ├─ CTA.vue
│  │  ├─ Create/System.vue
│  │  ├─ Edit/{App.vue,Core.vue,Preview.vue}
│  │  ├─ Preview.vue
│  │  ├─ Profile.vue
│  │  └─ Sections/{LocalCollection.vue,GlobalCollection.vue}
│  └─ shared/SupplierQuickCreate.vue
```

## Canonical stacks (avoid double “create” confusion)

- **Jobs**

  - Pages: `pages/jobs/index.vue`, `pages/jobs/create.vue`, detail/learn-more/edit
  - CTA: `components/Organisms/Jobs/CTA.vue` (surface on index)
  - Listing: `components/Organisms/Jobs/Sections/{AgentCollection,GlobalCollection}.vue`
  - Create UI: `components/Organisms/Jobs/Create.vue`
  - Object-level create system: `components/Organisms/objects/Job/Create/System.vue`

- **Blog**

  - Pages: `pages/blog/index.vue`, `pages/blog/create.vue`, detail
  - CTA: `components/organisms/Blog/CTA.vue` (surface on index, admin-gated like products)
  - Listing: `components/organisms/Blog/List.vue` (+ Cards)
  - Create system: `components/organisms/Blog/Create/System.vue`
  - Object-level entry: `components/organisms/Blog/objects/Post/Create/System.vue`

- **Product**

  - Pages: `pages/products/index.vue`, `pages/products/create.vue`, detail
  - CTA: `components/organisms/Product/CTA.vue`
  - Listing: `components/organisms/Product/Cards/List.vue`
  - Create system: `components/organisms/Product/Create/System.vue`

- **Kitchen (misebox)**
  - Page surface: uses `Kitchen/KitchenWizard.vue`
  - Related object create lives under `objects/Ingredient/Create/System.vue` (wizard stays top-level, not under objects)
  - If we want parity with jobs/blog/products, we can introduce a `Kitchen/CTA.vue` and a dedicated create route using the wizard.

## Jobs stack

- Pages
  - `packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue` (UPage + skeleton + CTA + sections)
  - `packages/extensions/fireux-jobs/src/runtime/pages/jobs/create.vue` (agent-only gate, renders `OrganismsJobsCreate`)
  - `packages/extensions/fireux-jobs/src/runtime/pages/jobs/[id].vue`
  - `packages/extensions/fireux-jobs/src/runtime/pages/jobs/learn-more.vue`
  - `packages/extensions/fireux-jobs/src/runtime/pages/jobs/edit/`
- CTA
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/CTA.vue`
- Collections/sections
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Sections/AgentCollection.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Sections/GlobalCollection.vue`
- Create system
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Create.vue`

Tree

````
packages/extensions/fireux-jobs/src/runtime/
├─ pages/jobs/
│  ├─ [id].vue
│  ├─ create.vue
│  ├─ edit/
│  ├─ index.vue
│  └─ learn-more.vue
└─ components/Organisms/Jobs/
   ├─ CTA.vue
   ├─ Create.vue
   └─ Sections/
      ├─ AgentCollection.vue
      # Stack Audit — structure, naming, CTAs

      This file describes how the current “stacks” (Jobs, Blog, Products, Places, Misebox, Core) are built, what they have in common, where they differ, and what we want the canonical pattern to be going forward.

      The goal: **make it easy to add a new stack** (e.g. Reviews, Events, Orders) by following a clear, repeatable template, while respecting that some domains are **profiles** (onboard then edit) and some are **objects** (must be completed before publishing).

      ---

      ## 1. Baseline conventions

      ### 1.1 Two kinds of stacks

      We distinguish between:

      1. **Profile stacks** (onboard → update)
         - Examples: App, User, Agent, Professional, Chef, Supplier.
         - Behaviour:
           - We facilitate **minimal onboarding** during sign-up or first use.
           - We **do not** require a “complete” profile before allowing usage.
           - Users can update/extend profile fields later.
         - Implication:
           - No heavy `Create/` flow is required at the domain root.
           - Onboarding is typically handled by auth flows + lightweight create/update forms.

      2. **Object stacks** (create → complete → publish)
         - Examples: Blog Post, Job, Product (and usually Ingredients/Recipes).
         - Behaviour:
           - Each object must be **deliberately created** and **complete enough** before sending/publishing.
           - We want a clear “create system” that can enforce required fields and validation.
         - Implication:
           - A proper `Create/` directory is required at the domain layer (and sometimes an additional `objects/` layer).
           - These stacks have explicit **create pages** and **create organisms**.

      This distinction is core:

      - **Profiles**: onboard once, then edit.
      - **Objects**: create per item, must be valid/complete before being sent.

      ---

      ### 1.2 Pages

      For **object stacks** (Blog, Jobs, Products, etc.):

      - `pages/<feature>/index.vue`
        - `UPage` + `UPageHeader` + `UPageBody`
        - Renders:
          - A CTA organism at the top
          - Loading state for the collection
          - Empty state
          - List/cards view
      - `pages/<feature>/create.vue`
        - Explicit create route
        - Protected (admin / role / agent)
        - Renders a `Create` organism/system
      - `pages/<feature>/[slug|id].vue`
        - Detail view (read-only or mixed)

      For **profile stacks** (App, User, Chef, Supplier, Agent, Professional):

      - There may be profile-related pages (e.g. `/profiles/agent`, `/profiles/chef`, dashboard pages).
      - Creation of the profile is typically tied to:
        - Auth/onboarding flows
        - Simple “quick create” forms
      - No requirement for a `pages/<profile>/create.vue` that must fully “complete” the profile before use.

      ---

      ### 1.3 Organisms layout

      For **object stacks** under `components/organisms/<Domain>/` we aim for:

      - `CTA.vue`
        - Root CTA for creating new objects
        - Can be universal, admin-only, or role-gated
      - `Cards/`
        - Canonical minimal triplet:
          - `Cell.vue`
          - `Pill.vue`
          - `Profile.vue`
        - Plus domain-specific extras (e.g. `Article.vue`, `Page.vue`, `Product.vue`, `List.vue`, `Prices.vue`)
      - `Create/`
        - Required for object stacks
        - Entry point:
          - `System.vue` (main create system)
        - Optional subforms:
          - `Basic.vue`, `Write.vue`, `Preview.vue`, `Advanced.vue`, `Images.vue`, `Price.vue`, `Stock.vue`, etc.
      - `objects/<Object>/Create/System.vue` (optional but recommended when reused)
        - “Object-layer” entry point when multiple stacks/views share the same underlying object (Job, Ingredient, Recipe, Product, Post)

      Deviation flags for **object stacks**:

      - Missing `Create/` at the domain level.
      - Domain has a create flow but no clear `System.vue` entrypoint.
      - Missing `Cards/` dir or canonical `Cell/Pill/Profile` where peers have them.
      - CTA missing or located somewhere non-obvious.

      For **profile stacks**, we mainly care about:

      - Profile **CTA** (how to start/upgrade profile).
      - Profile **Cards** dir (for listing/profile views).
      - Profile **Edit** and **Preview** structures.
      - Onboarding flows can be small, inline, and do not need heavy `Create/` directories.

      ---

      ## 2. Stack summaries

      ### 2.1 Core (fireux-core)

      **Organisms tree**

      `packages/core/fireux-core/src/runtime/components/organisms/`:

      - `App/`
        - `Cards/{Cell.vue,Pill.vue,Profile.vue}`
        - `Collection.vue`
        - `Edit/{App.vue,Core.vue}`
        - `Preview.vue`
      - `Auth/{Authenticated.vue,Email.vue,EmailPanel.vue,Google.vue,System.vue}`
      - `Dashboard/Profile/Edit/Profile.vue`
      - `Profile/{Root.vue,Page.vue,List.vue,Sections/Single.vue}`
      - `User/`
        - `Cards/{Cell.vue,Pill.vue,Profile.vue}`
        - `CTA.vue`
        - `Collection.vue`
        - `Edit/{App.vue,Core.vue,Preview.vue}`
        - `Preview.vue`

      **Type:** Profile stack (App/User are profiles, not per-item objects).

      **Alignment**

      - No `Create/` directory is required for App/User:
        - App onboarding happens via configuration and app creation flows.
        - User onboarding happens via auth + minimal profile fields.
      - Cards pattern (`Cell/Pill/Profile`) is strong and used as a baseline.

      ---

      ### 2.2 Jobs stack (fireux-jobs)

      **Type:** Object stack (Jobs themselves must be complete before publishing), plus profile stacks (Agent/Professional).

      **Pages**

      `packages/extensions/fireux-jobs/src/runtime/pages/jobs/`:

      - `index.vue`
        - UPage + header + body
        - Renders:
          - `Organisms/Jobs/CTA.vue`
          - Jobs sections (AgentCollection, GlobalCollection)
      - `create.vue`
        - Agent-only gate
        - Renders `Organisms/Jobs/Create.vue` (object create system at domain level)
      - `[id].vue`
        - Job detail view
      - `learn-more.vue`
        - Marketing/education surface
      - `edit/`
        - Edit flows for jobs

      **Organisms**

      `packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/`:

      - `CTA.vue`
        - Role-gated CTA (requires Agent profile)
      - `Create.vue`
        - Domain-level create system for Jobs
      - `Sections/`
        - `AgentCollection.vue`
        - `GlobalCollection.vue`

      **Objects**

      `packages/extensions/fireux-jobs/src/runtime/components/Organisms/objects/Job/Create/System.vue`:

      - Object-layer create system for Job.

      **Profiles**

      `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/`:

      - `Agent/` (profile stack)
      - `Professional/` (profile stack)

      Each profile:

      - `Cards/{Cell.vue,Pill.vue}`
      - `CTA.vue`
      - `Create/System.vue`
      - `Edit/{App.vue,Core.vue,Preview.vue}`
      - `Profile.vue`
      - `Preview.vue`
      - `Sections/{GlobalCollection.vue,LocalCollection.vue}`

      **Alignment**

      - Jobs (object stack):
        - ✅ Has `Create.vue` at the domain level.
        - ✅ Has `objects/Job/Create/System.vue` for object logic.
        - ✅ Has root `Jobs/CTA.vue`.
      - Profiles (Agent/Professional) are **profile stacks**:
        - ✅ Minimal onboarding/creation allowed.
        - ✅ Edit flows present.
        - ⚠ Cards lack `Profile.vue` card.

      ---

      ### 2.3 Blog stack (fireux-blogs)

      **Type:** Object stack (posts must be created intentionally and complete enough to publish).

      **Pages**

      `packages/extensions/fireux-blogs/src/runtime/pages/blog/`:

      - `index.vue`
        - CTA: `Blog/CTA.vue` (admin-only)
        - Loading skeleton while posts collection pending
        - Empty state when no posts
        - `Blog/List.vue` for list display
      - `create.vue`
        - Admin-only gate
        - Renders `Blog/Create/System.vue`
      - `[slug].vue`
        - Post detail

      **Organisms**

      `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/`:

      - `CTA.vue`
      - `List.vue`
      - `Cards/`
        - `Article.vue`
        - `Cell.vue`
        - `Page.vue`
        - `Product.vue`
      - `Create/`
        - `System.vue`
        - `Write.vue`
        - `Preview.vue`
        - `Advanced.vue`
        - `Images.vue`

      **Alignment**

      - ✅ This is an object stack with a proper `Create/System.vue`.
      - ✅ Root CTA exists and is admin-gated.
      - ⚠ Object-layer wrapper under `objects/Post/Create/System.vue` exists; keep using it where shared.
      - ⚠ Cards differ from canonical `Cell/Pill/Profile` triplet but have `Cell` and domain-specific variants.

      ---

      ### 2.4 Products stack (fireux-products)

      **Type:** Object stack (products must be fully defined before publishing).

      **Pages**

      `packages/extensions/fireux-products/src/runtime/pages/products/`:

      - `index.vue`
        - CTA: `Product/CTA.vue` (admin-only)
        - Loading skeleton while products collection pending
        - Empty state when no products
        - `Product/Cards/List.vue` when products exist
      - `create.vue`
        - Admin-only gate
        - Renders `Product/Create/System.vue`
      - `[slug].vue`
        - Product detail

      **Organisms**

      `packages/extensions/fireux-products/src/runtime/components/organisms/Product/`:

      - `CTA.vue`
      - `Cards/`
        - `List.vue`
        - `Prices.vue`
        - `Product.vue`
      - `Create/`
        - `System.vue`
        - `Basic.vue`
        - `Write.vue`
        - `Preview.vue`
        - `Price.vue`
        - `Prices.vue`
        - `Stock.vue`

      **Alignment**

      - ✅ Proper Create directory with `System.vue` is present (object stack requirement).
      - ✅ Root CTA exists and is admin-gated.
      - ⚠ Lacks canonical `Cell/Pill/Profile` cards.

      ---

      ### 2.5 Places stack (fireux-places)

      **Type:** Mostly search/browse stack (not clearly object-create yet).

      **Pages**

      `packages/extensions/fireux-places/src/runtime/pages/places/`:

      - `index.vue`
        - Search + results with `<Suspense>` fallback.

      **Organisms**

      `packages/extensions/fireux-places/src/runtime/components/organisms/places/`:

      - `Cell.vue`
      - `List.vue`
      - `Search/Bar.vue`
      - `Search/Dropdown.vue`
      - `Search/Section.vue`
      - `Search/Selected.vue`

      **Alignment**

      - No `Create/` dir — consistent with the idea that Places is **currently search-first**, not a create-heavy object stack.
      - ⚠ No root CTA.
      - ⚠ No `Cards/` dir; `Cell.vue` lives directly under `places/`.
      - ⚠ Folder name uses lowercase domain (`places/`) vs capitalised elsewhere.

      ---

      ### 2.6 Misebox ecosystem (fireux-misebox)

      **Type:** Mixed: profiles (Chef, Supplier), objects (Ingredient, Recipe), plus Kitchen.

      **Organisms**

      `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/`:

      - `Kitchen/KitchenWizard.vue`
      - `objects/Ingredient/`
        - `Cards/{Cell.vue,Pill.vue,Profile.vue}`
        - `Create/System.vue`
        - `Profile.vue`
        - `Edit.vue`
      - `objects/Recipe/`
        - `Cards/Pill.vue` (snippet shows only this)
      - `profiles/Chef/`
        - `Cards/{Cell.vue,Pill.vue}`
        - `CTA.vue`
        - `Create/System.vue`
        - `Edit/{App.vue,Core.vue,Preview.vue}`
        - `Preview.vue`
        - `Profile.vue`
        - `Sections/{LocalCollection.vue,GlobalCollection.vue}`
      - `profiles/Supplier/`
        - Same structure as Chef
      - `profiles/shared/SupplierQuickCreate.vue`

      **Alignment**

      - Ingredient is an **object stack**:
        - ✅ Has `Create/System.vue`.
        - ✅ Has `Cards/{Cell,Pill,Profile}`.
      - Chef/Supplier are **profile stacks**:
        - ✅ Have CTAs, cards, create (onboarding) and edit flows.
      - Kitchen is currently a **wizard-style flow**:
        - ⚠ No root `Kitchen/CTA.vue` or `pages/kitchen/index.vue` yet.
      - Recipe appears as an **object stack in waiting**:
        - ⚠ Only `Cards/Pill.vue` visible; no `Create/System.vue`, no `Cell/Profile` cards.

      ---

      ## 3. CTA taxonomy

      ### 3.1 Root/domain CTAs

      **Object stacks (create → complete → publish)**

      - Jobs: `Jobs/CTA.vue` (agent role)
      - Blog: `Blog/CTA.vue` (admin-only)
      - Products: `Product/CTA.vue` (admin-only)
      - Ingredient: exposed more through objects, but can be extended similarly.

      **Profile stacks (onboard → update)**

      - Core: `User/CTA.vue`
      - Jobs profiles: `Agent/CTA.vue`, `Professional/CTA.vue`
      - Misebox profiles: `Chef/CTA.vue`, `Supplier/CTA.vue`

      **Missing / TBD**

      - Places: no CTA yet.
      - Kitchen: wizard exists, but no `Kitchen/CTA.vue` root surface.

      ---

      ## 4. Recommendations & guardrails

      ### 4.1 Create directories

      - **Object stacks MUST have:**
        - `pages/<feature>/create.vue`
        - `components/organisms/<Domain>/Create/System.vue`
      - **Profile stacks DO NOT need a heavy `Create/` dir:**
        - Onboarding is light and integrated into auth/profile setup.
        - They SHOULD have:
          - `CTA.vue` for starting/upgrading profile.
          - `Edit/` and `Preview/` as needed.

      ### 4.2 Cards pattern

      - For **reusable domains** (User, App, Ingredient, Profiles, etc.) we prefer:
        - `Cards/{Cell.vue,Pill.vue,Profile.vue}`
      - For object stacks like Blog/Products:
        - Maintain `Cards/` directory.
        - Canonical `Cell/Pill/Profile` are recommended but **domain-specific cards** (Article, Page, Product, List, Prices) are acceptable.
      - Incremental tasks:
        - Add `Profile` cards for Agent/Professional.
        - Add minimal `Cell/Pill/Profile` under Product if it helps reuse.
        - Decide whether Recipe needs a full create flow and cards, or remains a simple “Pill only” domain.

      ### 4.3 CTAs

      - Every **object stack** with a create flow should have:
        - A root CTA mounted at the top of its index `UPageBody`.
        - Gating defined clearly (admin-only vs role-based).
      - **Profile stacks**:
        - Need CTAs scoped to their profile context, not necessarily at a global index.

      ### 4.4 Objects layer

      - Use `objects/<Object>/Create/System.vue` when:
        - Multiple stacks/views share the same underlying object.
        - You want a reusable engine for creation.
      - Don’t force it on profile stacks or small stacks where it adds confusion.

      ### 4.5 Directory naming & casing

      - Prefer:

      ```txt
      components/organisms/<Domain>/
      ```

      - `organisms/` lowercase and `<Domain>/` capitalised.
      - Jobs currently uses `components/Organisms/Jobs/`; Places uses `components/organisms/places/`.
      - These can be normalised when the churn is worth it.

      ### 4.6 Guardrails for new stacks

      When adding a new **object stack**:

      1) Create:
         - `pages/<feature>/index.vue`
         - `pages/<feature>/create.vue`
         - `pages/<feature>/[id].vue` (or `[slug].vue`)
      2) Under `components/organisms/<Domain>/`:
         - `CTA.vue`
         - `Cards/` (at least `Cell.vue`; ideally `Cell/Pill/Profile`)
         - `Create/System.vue`
      3) Optional:
         - `objects/<Object>/Create/System.vue` if shared.
      4) Decide gating (admin/role).
      5) Implement index pattern: CTA → loading → empty → list.

      When adding a new **profile stack**:

      1) Decide where onboarding lives (auth/profile flows).
      2) Under `components/organisms/<ProfileDomain>/`:
         - `CTA.vue` (to nudge or upgrade profile)
         - `Cards/{Cell.vue,Pill.vue,Profile.vue}`
         - `Edit/{App.vue,Core.vue,Preview.vue}`
         - `Profile.vue`
      3) No strict `Create/` directory required; keep onboarding minimal and focused on speed.

      ---
````
