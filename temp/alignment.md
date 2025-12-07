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
├─ objects/Product/Create/System.vue
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
  - Object-level entry: `components/organisms/Product/objects/Product/Create/System.vue`

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

```
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
      └─ GlobalCollection.vue
```

## Blog stack

- Pages
  - `packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue` (UPage + skeleton + admin CTA + list)
  - `packages/extensions/fireux-blogs/src/runtime/pages/blog/create.vue` (admin-only gate, renders `FireOrganismsBlogCreateSystem`)
  - `packages/extensions/fireux-blogs/src/runtime/pages/blog/[slug].vue`
- CTA
  - `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/CTA.vue`
- Lists/cards
  - `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/List.vue`
  - `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Cards/Article.vue`
  - `.../Cards/Cell.vue`
  - `.../Cards/Page.vue`
  - `.../Cards/Product.vue`
- Create system
  - `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Create/System.vue`
  - `.../Create/Write.vue`
  - `.../Create/Preview.vue`
  - `.../Create/Advanced.vue`
  - `.../Create/Images.vue`

Tree

```
packages/extensions/fireux-blogs/src/runtime/
├─ pages/blog/
│  ├─ [slug].vue
│  ├─ create.vue
│  └─ index.vue
└─ components/organisms/Blog/
   ├─ CTA.vue
   ├─ List.vue
   ├─ Cards/
   │  ├─ Article.vue
   │  ├─ Cell.vue
   │  ├─ Page.vue
   │  └─ Product.vue
   └─ Create/
      ├─ Advanced.vue
      ├─ Images.vue
      ├─ Preview.vue
      ├─ System.vue
      └─ Write.vue
```

## Products stack

- Pages
  - `packages/extensions/fireux-products/src/runtime/pages/products/index.vue` (UPage + skeleton + admin CTA + list)
  - `packages/extensions/fireux-products/src/runtime/pages/products/create.vue` (admin-only gate, renders `FireOrganismsProductCreateSystem`)
  - `packages/extensions/fireux-products/src/runtime/pages/products/[slug].vue`
- CTA
  - `packages/extensions/fireux-products/src/runtime/components/organisms/Product/CTA.vue`
- Lists/cards
  - `packages/extensions/fireux-products/src/runtime/components/organisms/Product/Cards/List.vue`
  - `.../Cards/Prices.vue`
  - `.../Cards/Product.vue`
- Create system
  - `packages/extensions/fireux-products/src/runtime/components/organisms/Product/Create/System.vue`
  - `.../Create/Basic.vue`
  - `.../Create/Preview.vue`
  - `.../Create/Price.vue`
  - `.../Create/Prices.vue`
  - `.../Create/Stock.vue`
  - `.../Create/Write.vue`

Tree

```
packages/extensions/fireux-products/src/runtime/
├─ pages/products/
│  ├─ [slug].vue
│  ├─ create.vue
│  └─ index.vue
└─ components/organisms/Product/
   ├─ CTA.vue
   ├─ Cards/
   │  ├─ List.vue
   │  ├─ Prices.vue
   │  └─ Product.vue
   └─ Create/
      ├─ Basic.vue
      ├─ Preview.vue
      ├─ Price.vue
      ├─ Prices.vue
      ├─ Stock.vue
      └─ Write.vue
```
