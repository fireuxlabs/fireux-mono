# Dev Pages Filepaths

Agent note: This static list inventories all dev-oriented pages across the repo. The app’s dev navigation is meta-driven via route meta (layouts: ['dev']). Use this list for discovery and cross-package references only.

Core app pages

- packages/core/fireux-core/src/runtime/pages/dev/index.vue
- packages/core/fireux-core/src/runtime/pages/dev/app.vue
- packages/core/fireux-core/src/runtime/pages/dev/fireux-core.vue
- packages/core/fireux-core/src/runtime/pages/dev/users.vue

Extensions (if present)

- packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue

Tenants/apps

- packages/tenants/fireux-misebox/src/runtime/pages/dev/index.vue
- packages/tenants/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue

Project-level design/dev docs

- Public design showcase (not under dev): projects/fireux/fireux-app/app/pages/design/index.vue

How navigation works

- Add route meta: { nav: { key, label, icon?, group, order?, layouts: ['dev'] } }
- The dev layout reads links from the nav composable and will auto-include any page with layouts:['dev'].
- Optional: use nav.order to control simple sort order within groups.

Groups used in this repo

- core — core dev pages
- misebox — tenant/global diagnostics (current ecosystem)
- app — app-specific dev pages (e.g., fireux-app showcase)
- ext — extension dev pages
