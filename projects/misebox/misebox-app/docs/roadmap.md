# Misebox App Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

-- Marketing landing page (`/`) with hero, quick peek, and solutions sections
-- Visual polish elements (steam effect, Nuxt UI theming)

## ⚙️ In Progress

-- None detected

## ❌ Missing

-- Chef profile management (create, edit, share) with QR export
-- Verified work history and references workflow
-- Recipe management: cost, scaling, nutritional/allergen data
-- Kitchen prep planning tools and station scheduling
-- Supplier and inventory integration with reorder tracking
-- Job search and temporary placement system
-- Analytics dashboards for kitchens and professionals
-- Dedicated pages/routes: `/get-started`, `/professional`, `/jobs`, `/kitchens`, `/recipes`, `/suppliers`, `/prep-plans`

## 🧩 Planned / Cross-Package Dependencies

-- Shared Misebox data models (profiles, recipes, suppliers, prep plans) should originate in `packages/tenants/fireux-misebox` or `fireux-core` to support multiple tenants.
-- Job workflows may depend on `packages/extensions/fireux-jobs` once built out.
-- Analytics foundation likely belongs in `fireux-core` (events, summaries) before tenant dashboards can consume it.

## Next Actions

- [ ] Align with core/Misebox package owners on data schemas and composables for profiles, recipes, suppliers, prep plans, and analytics.
- [ ] Scaffold placeholder routes and navigation for the promised pages to unblock incremental development.
- [ ] Implement MVP flows for profile creation, recipe management, supplier lists, and prep planning.
- [ ] Integrate job features (posting, search) using shared extension work once available.
- [ ] Add analytics event capture and dashboards for kitchens and professionals.
- [ ] Reconcile `liturature.md` once key modules ship to ensure marketing copy matches functionality.
