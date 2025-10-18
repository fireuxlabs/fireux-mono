# FireUX Misebox Tenant Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Chef and supplier profile surfaces wired to the shared FireUX profile engine (`pages/chefs/index.vue`, `pages/suppliers/index.vue`, dashboard editors)
- Kitchen listing and manual linking flows backed by Firestore via `useKitchens` / `useKitchenCreation`
- Ingredient collection wrappers (`useIngredient`) powering basic ingredient cards

## ⚙️ In Progress

- Nothing identified in this package

## ❌ Missing

- Tenant-level branding tokens, typography, and iconography overrides
- Recipe discovery and costing (real data source, filters, create flow, costing helper composables)
- Supplier console tooling (connector management, contract docs, reorder alerts)
- Prep plans and scheduling utilities (calendar UI, station templates, capacity warnings)
- Fixture/seed data for kitchens, stations, menus, ingredients, allergens
- Automation hooks for inventory sync, supplier updates, and POS/accounting exports

## 🧩 Planned / Cross-Package Dependencies

- Recipes and prep workflows should align with future `fireux-core`/`fireux-recipes` models before building tenant UI
- Supplier and inventory sync likely belongs in `fireux-places` or a shared ops extension to avoid duplicating connectors
- Automation and analytics integrations may require new shared services (events pipeline, export workers)

## Next Actions

- [ ] Design and register Misebox-specific theme tokens (colors, fonts, icon set) and apply them to layouts/navigation
- [ ] Build real recipe data composables (list/detail/create) backed by Firestore and include costing utilities
- [ ] Implement supplier console screens for connectors, contract documents, and reorder alerting
- [ ] Deliver prep calendar UI with station templates and capacity warnings linked to kitchens
- [ ] Publish seed scripts/fixtures for kitchens, menus, allergens, and sample data to support demos
- [ ] Introduce automation hooks or background jobs for inventory/POS integrations and document configuration
