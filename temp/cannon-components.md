# Cannon components (components only)

Canon rules (components-only index)
- All profiles live under: `components/organisms/profiles/<Domain>/...`
- All objects live under: `components/organisms/objects/<Object>/...`
- Every profile has: `CTA`, `Preview`, `Profile`, `Create/System`, `Edit/{Core,App,Preview}`, `Cards/{Pill,Cell}`, `Sections/{GlobalCollection,LocalCollection}`
- Every object has at minimum: `Create/System` (and when it’s browsable: `CTA` + `Cards/*`; optionally `List`, `Profile`, `Sections/*`)
- `Pill` is mandatory wherever the object/profile is browsable
- No component paths outside `organisms/**` belong in this doc

Note: `fireux-core` App currently has no `CTA.vue` (accepted).

---

## A) Core (fireux-core)

### A1) User
- packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Collection.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Preview.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Cards/Cell.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Cards/Pill.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Cards/Profile.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Edit/App.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Core.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Preview.vue

### A2) App
- packages/core/fireux-core/src/runtime/components/organisms/App/Collection.vue
- packages/core/fireux-core/src/runtime/components/organisms/App/Preview.vue
- packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Cell.vue
- packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue
- packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue
- packages/core/fireux-core/src/runtime/components/organisms/App/Edit/App.vue
- packages/core/fireux-core/src/runtime/components/organisms/App/Edit/Core.vue

### A3) Profile shell
_Removed: core Profile organism layer was deleted._

### A4) Shared create shell
- packages/core/fireux-core/src/runtime/components/molecules/Create/Shell.vue

---

## B) Profiles

### B1) Chef (fireux-misebox)
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Preview.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Profile.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Create/System.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit/App.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit/Core.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit/Preview.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Sections/GlobalCollection.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Sections/LocalCollection.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Cell.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Pill.vue

### B2) Supplier (fireux-misebox)
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Preview.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Profile.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Create/System.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Edit/App.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Edit/Core.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Edit/Preview.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Sections/GlobalCollection.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Sections/LocalCollection.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Cell.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Pill.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/shared/SupplierQuickCreate.vue

### B3) Agent (fireux-jobs)
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/CTA.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Preview.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Profile.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Create/System.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Edit/App.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Edit/Core.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Edit/Preview.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Sections/GlobalCollection.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Sections/LocalCollection.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Cards/Cell.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Cards/Pill.vue

### B4) Professional (fireux-jobs)
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/CTA.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Preview.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Profile.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Create/System.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Edit/App.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Edit/Core.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Edit/Preview.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Sections/GlobalCollection.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Sections/LocalCollection.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Cards/Cell.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Cards/Pill.vue

---

## C) Objects

### C1) Blog (fireux-blogs)
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/CTA.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/List.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Article.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Cell.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Page.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Product.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/System.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Write.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Preview.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Advanced.vue
- packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Images.vue

### C2) Product (fireux-products)
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/CTA.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/List.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/Product.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/Prices.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/System.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Write.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Preview.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Basic.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Prices.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Price.vue
- packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Stock.vue

### C3) Place (fireux-places)
- packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/List.vue
- packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Cell.vue
- packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Section.vue
- packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Bar.vue
- packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Dropdown.vue
- packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Selected.vue

### C4) Ingredient (fireux-misebox)
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Profile.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Edit.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Cards/Pill.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Cards/Cell.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Cards/Profile.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Create/System.vue

### C5) Recipe (fireux-misebox)
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Recipe/Cards/Pill.vue

### C6) Kitchen (fireux-misebox)
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Kitchen/Create/System.vue

### C7) Job (fireux-jobs)
- packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/CTA.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Create/System.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Create/Write.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Create/Preview.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Sections/AgentCollection.vue
- packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Sections/GlobalCollection.vue
