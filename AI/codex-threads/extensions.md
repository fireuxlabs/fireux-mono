# FireUX Extensions - Recent Scan (Codex)

Updated: 2026-02-28
Scope: extension module changes and guardrails.

Latest commit:
- 20b2754f (2026-02-19) updated multiple extension runtime files and pages.

Touched modules and files:
- fireux-blogs: useBlogCreateSubmit, useBlogDraftState
- fireux-companies: useCompanyInterface
- fireux-jobs: Job/Collection/Provider.vue
- fireux-kitchens: pages-config, read-only scenario broth-bloom, runtime kitchen document, kitchen fetch, console dishes/menu pages, kitchens/[id]/menu
- fireux-places: usePlacesInterface
- fireux-products: Product CTA component, admin licenses page
- scripts: migrate-tapberne-menu-items-to-dishes.mjs, migrate-tapberne-menus.mjs
- pnpm-lock.yaml updated

Guardrails:
- Keep extension runtime APIs stable; avoid breaking view contracts.
- Prefer explicit composable imports and consistent naming.

Open follow-ups:
- Align extension versions and compatibility ranges.
- Standardize Nuxt kit import style.
- Resolve blog route naming and README placeholders.

#end
