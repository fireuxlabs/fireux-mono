# Page Meta Report

Generated: 2026-03-02T11:57:37.372Z
Canon version: `server-projection-v1`
Scan scope:
- Included: files under any `pages/` directory across `apps/**`, `packages/**`, `projects/**`.
- Included checks: `useSeoMeta`, `useHead`, `definePageMeta`, placeholder/auth gate heuristics.
- Excluded: `node_modules`, build outputs, `.git`, docs-only folders.

## Summary
- Total pages found: 190
- Pages with `useSeoMeta`: 30
- Pages with only `useHead`: 51
- Pages with only `definePageMeta`: 71
- Pages with none: 38
- Pages that likely render placeholder text like “Loading…”: 12

## Results

| App/Package | File | Route (best-effort) | SEO Meta | Title present? | Description present? | Canonical present? | Robots present? | Placeholder risk? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/@[handle].vue | /@:handle | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/auth.vue | /auth | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/index.vue | /console | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/admin.vue | /console/admin | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/developer.vue | /console/developer | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/favorites.vue | /console/favorites | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/followers.vue | /console/followers | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/purchases.vue | /console/purchases | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/settings.vue | /console/settings | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/subscriptions.vue | /console/subscriptions | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/console/user-profile.vue | /console/user-profile | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/index.vue | /dashboard | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/admin.vue | /dashboard/admin | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/developer.vue | /dashboard/developer | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/favorites.vue | /dashboard/favorites | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/followers.vue | /dashboard/followers | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/purchases.vue | /dashboard/purchases | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/settings.vue | /dashboard/settings | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/subscriptions.vue | /dashboard/subscriptions | definePageMeta | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue | /dashboard/user-profile | useHead | yes | no | no | no | med | definePageMeta with additional head/meta helpers; client/auth gating heuristic |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dev/index.vue | /dev | definePageMeta | yes | yes | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dev/apps.vue | /dev/apps | definePageMeta | yes | yes | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dev/avatars.vue | /dev/avatars | definePageMeta | yes | yes | no | no | med | placeholder text heuristic |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dev/forms.vue | /dev/forms | definePageMeta | yes | yes | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dev/images.vue | /dev/images | definePageMeta | yes | yes | no | no | med | client/auth gating heuristic |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/dev/users.vue | /dev/users | definePageMeta | yes | yes | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/legal/privacy.vue | /legal/privacy | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/legal/terms.vue | /legal/terms | none | no | no | no | no | low |  |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/users/index.vue | /users | useSeoMeta | yes | yes | yes | yes | low | uses useSeoMeta + useHead; definePageMeta with additional head/meta helpers |
| packages/core/fireux-core | packages/core/fireux-core/src/runtime/pages/users/[handle].vue | /users/:handle | useSeoMeta | yes | yes | yes | yes | med | uses useSeoMeta + useHead; client/auth gating heuristic |
| packages/core/fireux-ecosystem-controller | packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/index.vue | /apps | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/core/fireux-ecosystem-controller | packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/[id].vue | /apps/:id | useHead | yes | no | no | no | med | client/auth gating heuristic |
| packages/ecosystem/fireux-bringli | packages/ecosystem/fireux-bringli/src/runtime/pages/dev/fireux-bringli.vue | /dev/fireux-bringli | definePageMeta | no | no | no | no | low |  |
| packages/ecosystem/fireux-cleanbox | packages/ecosystem/fireux-cleanbox/src/runtime/pages/dev/fireux-cleanbox.vue | /dev/fireux-cleanbox | definePageMeta | no | no | no | no | low |  |
| packages/ecosystem/fireux-fireux | packages/ecosystem/fireux-fireux/src/apps/stitch/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/ecosystem/fireux-granite | packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/index.vue | /console/portfolio | definePageMeta | no | no | no | no | low |  |
| packages/ecosystem/fireux-granite | packages/ecosystem/fireux-granite/src/runtime/pages/dashboard/portfolio/index.vue | /dashboard/portfolio | none | no | no | no | no | low |  |
| packages/ecosystem/fireux-granite | packages/ecosystem/fireux-granite/src/runtime/pages/dashboard/portfolio/[...slug].vue | /dashboard/portfolio/:slug(.*)* | none | no | no | no | no | low |  |
| packages/ecosystem/fireux-granite | packages/ecosystem/fireux-granite/src/runtime/pages/dev/fireux-granite.vue | /dev/fireux-granite | definePageMeta | no | no | no | no | low |  |
| packages/ecosystem/fireux-misebox | packages/ecosystem/fireux-misebox/src/runtime/pages/companies/index.vue | /companies | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/ecosystem/fireux-misebox | packages/ecosystem/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue | /dev/fireux-misebox | definePageMeta | no | no | no | no | low |  |
| packages/ecosystem/fireux-misebox | packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue | /recipes | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/ecosystem/fireux-misebox | packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/[slug].vue | /recipes/:slug | useHead | yes | no | no | no | med | definePageMeta with additional head/meta helpers; placeholder text heuristic |
| packages/extensions/fireux-blogs | packages/extensions/fireux-blogs/src/runtime/pages/admin/blogs/index.vue | /admin/blogs | useHead | yes | no | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-blogs | packages/extensions/fireux-blogs/src/runtime/pages/admin/blogs/create.vue | /admin/blogs/create | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-blogs | packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue | /blog | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-blogs | packages/extensions/fireux-blogs/src/runtime/pages/blog/[slug].vue | /blog/:slug | none | no | no | no | no | low |  |
| packages/extensions/fireux-blogs | packages/extensions/fireux-blogs/src/runtime/pages/dev/fireux-blogs.vue | /dev/fireux-blogs | definePageMeta | yes | no | no | no | low |  |
| packages/extensions/fireux-companies | packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue | /companies | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-companies | packages/extensions/fireux-companies/src/runtime/pages/companies/[id].vue | /companies/:id | useHead | yes | yes | no | no | high | legacy head() option; definePageMeta with additional head/meta helpers; placeholder text heuristic; client/auth gating heuristic |
| packages/extensions/fireux-companies | packages/extensions/fireux-companies/src/runtime/pages/companies/create.vue | /companies/create | useHead | yes | yes | no | no | low | legacy head() option; definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-companies | packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue | /companies/edit/:id | useHead | yes | yes | no | no | high | legacy head() option; definePageMeta with additional head/meta helpers; placeholder text heuristic; client/auth gating heuristic |
| packages/extensions/fireux-companies | packages/extensions/fireux-companies/src/runtime/pages/companies/learn-more.vue | /companies/learn-more | useHead | yes | yes | no | no | low | legacy head() option; definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-companies | packages/extensions/fireux-companies/src/runtime/pages/dev/fireux-companies.vue | /dev/fireux-companies | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-compliance | packages/extensions/fireux-compliance/src/runtime/pages/console/portfolio/compliance.vue | /console/portfolio/compliance | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-documents | packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue | /console/portfolio/documents | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/index.vue | /console/supplier | none | no | no | no | no | low |  |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/my-stock.vue | /console/supplier/my-stock | none | no | no | no | no | low |  |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/profile.vue | /console/supplier/profile | none | no | no | no | no | low |  |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/dashboard/supplier/index.vue | /dashboard/supplier | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/dashboard/supplier/my-stock.vue | /dashboard/supplier/my-stock | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/dashboard/supplier/profile.vue | /dashboard/supplier/profile | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/dev/fireux-suppliers.vue | /dev/fireux-suppliers | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue | /suppliers | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/[id].vue | /suppliers/:id | useSeoMeta | yes | yes | no | no | high | uses useSeoMeta + useHead; placeholder text heuristic; client/auth gating heuristic |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/admin/[id].vue | /suppliers/admin/:id | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-suppliers | packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/learn-more.vue | /suppliers/learn-more | useHead | yes | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue | /agents | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/agents/[id].vue | /agents/:id | useHead | yes | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/agents/admin/[id].vue | /agents/admin/:id | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/agents/learn-more.vue | /agents/learn-more | useHead | yes | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/console/agent/index.vue | /console/agent | none | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/console/agent/my-gigs.vue | /console/agent/my-gigs | none | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/console/agent/profile.vue | /console/agent/profile | none | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/console/professional/index.vue | /console/professional | none | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/console/professional/my-jobs.vue | /console/professional/my-jobs | none | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/console/professional/profile.vue | /console/professional/profile | none | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue | /dashboard/agent | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/my-gigs.vue | /dashboard/agent/my-gigs | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue | /dashboard/agent/profile | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/index.vue | /dashboard/professional | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/my-jobs.vue | /dashboard/professional/my-jobs | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue | /dashboard/professional/profile | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue | /dev/fireux-jobs | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue | /jobs | useHead | yes | yes | no | no | med | definePageMeta with additional head/meta helpers; client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/jobs/[id].vue | /jobs/:id | useHead | yes | no | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/jobs/create.vue | /jobs/create | useHead | yes | no | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/jobs/edit/[id].vue | /jobs/edit/:id | useHead | yes | no | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/jobs/learn-more.vue | /jobs/learn-more | useHead | yes | no | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue | /professionals | useHead | yes | yes | no | no | med | definePageMeta with additional head/meta helpers; client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/professionals/[id].vue | /professionals/:id | useHead | yes | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/professionals/admin/[id].vue | /professionals/admin/:id | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-jobs | packages/extensions/fireux-jobs/src/runtime/pages/professionals/learn-more.vue | /professionals/learn-more | useHead | yes | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/chefs/index.vue | /chefs | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/chefs/[id].vue | /chefs/:id | useSeoMeta | yes | yes | no | no | high | uses useSeoMeta + useHead; placeholder text heuristic; client/auth gating heuristic |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/chefs/admin/[id].vue | /chefs/admin/:id | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/chefs/learn-more.vue | /chefs/learn-more | useHead | yes | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/index.vue | /console/chef | none | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/my-recipes.vue | /console/chef/my-recipes | none | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/profile.vue | /console/chef/profile | none | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue | /console/kitchen | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue | /console/kitchen/dishes | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/haccp.vue | /console/kitchen/haccp | definePageMeta | yes | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue | /console/kitchen/ingredients | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue | /console/kitchen/menu | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise.vue | /console/kitchen/mise | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue | /console/kitchen/orders | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue | /console/kitchen/purchase-orders | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue | /console/kitchen/recipes | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/stations.vue | /console/kitchen/stations | definePageMeta | no | yes | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue | /console/kitchen/suppliers | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/team.vue | /console/kitchen/team | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/training.vue | /console/kitchen/training | definePageMeta | yes | yes | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/index.vue | /dashboard/chef | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue | /dashboard/chef/my-recipes | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue | /dashboard/chef/profile | definePageMeta | no | no | no | no | med | client/auth gating heuristic |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/index.vue | /dashboard/kitchen | none | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/[...slug].vue | /dashboard/kitchen/:slug(.*)* | none | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchens.vue | /dashboard/kitchens | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/dev/fireux-kitchens.vue | /dev/fireux-kitchens | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue | /ingredients | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/[id].vue | /ingredients/:id | useHead | yes | yes | no | no | med | definePageMeta with additional head/meta helpers; placeholder text heuristic |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue | /kitchens | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id].vue | /kitchens/:id | useHead | yes | yes | no | no | med | legacy head() option; definePageMeta with additional head/meta helpers; placeholder text heuristic |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu/[[menuId]].vue | /kitchens/:id/menu/:menuId? | useHead | yes | yes | no | no | med | legacy head() option; definePageMeta with additional head/meta helpers; placeholder text heuristic |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/create.vue | /kitchens/create | useHead | yes | yes | no | no | low | legacy head() option; definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/edit/[id].vue | /kitchens/edit/:id | useHead | yes | yes | no | no | high | legacy head() option; definePageMeta with additional head/meta helpers; placeholder text heuristic; client/auth gating heuristic |
| packages/extensions/fireux-kitchens | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/learn-more.vue | /kitchens/learn-more | useHead | yes | yes | no | no | low | legacy head() option; definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-orders | packages/extensions/fireux-orders/src/runtime/pages/orders/checkout.vue | /orders/checkout | useHead | yes | yes | no | no | low | legacy head() option; definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-places | packages/extensions/fireux-places/src/runtime/pages/dev/fireux-places.vue | /dev/fireux-places | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-places | packages/extensions/fireux-places/src/runtime/pages/places/index.vue | /places | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-places | packages/extensions/fireux-places/src/runtime/pages/places/[id].vue | /places/:id | useHead | yes | yes | no | no | high | legacy head() option; definePageMeta with additional head/meta helpers; placeholder text heuristic; client/auth gating heuristic |
| packages/extensions/fireux-places | packages/extensions/fireux-places/src/runtime/pages/places/create.vue | /places/create | useHead | yes | yes | no | no | low | legacy head() option; definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-places | packages/extensions/fireux-places/src/runtime/pages/places/edit/[id].vue | /places/edit/:id | useHead | yes | yes | no | no | high | legacy head() option; definePageMeta with additional head/meta helpers; placeholder text heuristic; client/auth gating heuristic |
| packages/extensions/fireux-places | packages/extensions/fireux-places/src/runtime/pages/places/learn-more.vue | /places/learn-more | useHead | yes | yes | no | no | low | legacy head() option; definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-products | packages/extensions/fireux-products/src/runtime/pages/admin/licenses/index.vue | /admin/licenses | definePageMeta | yes | no | no | no | low |  |
| packages/extensions/fireux-products | packages/extensions/fireux-products/src/runtime/pages/admin/products/index.vue | /admin/products | useHead | yes | no | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-products | packages/extensions/fireux-products/src/runtime/pages/admin/products/create.vue | /admin/products/create | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-products | packages/extensions/fireux-products/src/runtime/pages/dev/fireux-products.vue | /dev/fireux-products | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-products | packages/extensions/fireux-products/src/runtime/pages/products/index.vue | /products | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-products | packages/extensions/fireux-products/src/runtime/pages/products/[slug].vue | /products/:slug | none | no | no | no | no | low |  |
| packages/extensions/fireux-products | packages/extensions/fireux-products/src/runtime/pages/products/success.vue | /products/success | none | no | no | no | no | low |  |
| packages/extensions/fireux-properties | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue | /console/portfolio/properties | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-properties | packages/extensions/fireux-properties/src/runtime/pages/dashboard/portfolios.vue | /dashboard/portfolios | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-properties | packages/extensions/fireux-properties/src/runtime/pages/dev/fireux-properties.vue | /dev/fireux-properties | definePageMeta | no | no | no | no | low |  |
| packages/extensions/fireux-properties | packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue | /portfolios | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| packages/extensions/fireux-properties | packages/extensions/fireux-properties/src/runtime/pages/properties/[id].vue | /properties/:id | definePageMeta | yes | yes | no | no | low |  |
| packages/extensions/fireux-tasks | packages/extensions/fireux-tasks/src/runtime/pages/console/portfolio/tasks.vue | /console/portfolio/tasks | definePageMeta | yes | yes | no | no | low |  |
| projects/bringli/bringli-app | projects/bringli/bringli-app/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/cleanbox/cleanbox-app | projects/cleanbox/cleanbox-app/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/cleanbox/richies-reinigung | projects/cleanbox/richies-reinigung/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/cleanbox.vue | /cleanbox | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/core.vue | /core | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/cta-demo.vue | /cta-demo | none | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/design/index.vue | /design | useHead | yes | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/design/atoms/colors.vue | /design/atoms/colors | definePageMeta | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/design/atoms/img.vue | /design/atoms/img | definePageMeta | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/design/atoms/tokens.vue | /design/atoms/tokens | definePageMeta | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/design/atoms/typography.vue | /design/atoms/typography | definePageMeta | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/dev/index.vue | /dev | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/dev/registry.vue | /dev/registry | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/developer/index.vue | /developer | none | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/developer/registry.vue | /developer/registry | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/developer/skills.vue | /developer/skills | none | no | yes | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/developer/technologies.vue | /developer/technologies | none | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/ecosystems/index.vue | /ecosystems | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/get-started.vue | /get-started | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/getting-started.vue | /getting-started | none | no | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/misebox.vue | /misebox | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/modules/index.vue | /modules | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/modules/[id].vue | /modules/:id | definePageMeta | yes | yes | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/onboarding/index.vue | /onboarding | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/projects.vue | /projects | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/skills.vue | /skills | none | no | yes | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/solutions/index.vue | /solutions | useHead | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/solutions/fireux-app.vue | /solutions/fireux-app | definePageMeta | yes | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/solutions/fireux-template.vue | /solutions/fireux-template | definePageMeta | yes | no | no | no | low |  |
| projects/fireux/fireux-app | projects/fireux/fireux-app/app/pages/ui-demo.vue | /ui-demo | none | no | no | no | no | low |  |
| projects/fireux/tenant | projects/fireux/tenant/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/fireux/tenant | projects/fireux/tenant/app/pages/join.vue | /join | useSeoMeta | yes | yes | no | no | low |  |
| projects/fireux/tenant | projects/fireux/tenant/app/pages/onboarding.vue | /onboarding | useSeoMeta | yes | yes | no | no | low |  |
| projects/granite/granite-app | projects/granite/granite-app/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/granite/granite-app | projects/granite/granite-app/app/pages/demo.vue | /demo | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/misebox/la-tap-berne | projects/misebox/la-tap-berne/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/misebox/misebox-app | projects/misebox/misebox-app/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/misebox/misebox-app | projects/misebox/misebox-app/app/pages/get-started.vue | /get-started | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/misebox/misebox-app | projects/misebox/misebox-app/app/pages/programme.vue | /programme | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/misebox/niederhorn | projects/misebox/niederhorn/app/pages/index.vue | / | useSeoMeta | yes | yes | no | no | low | definePageMeta with additional head/meta helpers |
| projects/templates/fireux-template | projects/templates/fireux-template/app/pages/index.vue | / | none | no | no | no | no | low |  |

## Top Fix Targets

- No pages matched `(SEO Meta = none) + (Placeholder risk = high)`.
