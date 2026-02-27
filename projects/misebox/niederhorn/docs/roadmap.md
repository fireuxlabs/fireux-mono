# Niederhorn Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

-- Branding color overrides via `app.config.ts`
-- Landing page (`/`) with basic Niederhorn messaging and CTAs

## ⚙️ In Progress

-- None detected (project currently ships only the landing view)

## ❌ Missing

-- Recipe catalog with cost/scaling data and storage
-- Prep plan board by kitchen station (UI + data layer)
-- Supplier management views with ingredient linking
-- Team training modules (content, progress, and media support)
-- Internal notes/feedback workflow across chefs
-- Analytics consoles for ingredient usage, prep efficiency, and waste
-- Dedicated routes/pages for `/recipes`, `/prep-plans`, `/suppliers`, `/team`, `/analytics`
-- Integrations with Misebox Pro profiles and broader ecosystem features

## 🧩 Planned / Cross-Package Dependencies

-- Core recipe, supplier, and prep-plan data models should originate in `packages/ecosystem/fireux-misebox` (or `fireux-core`) so multiple Misebox tenants can share logic.
-- Shared analytics/composable layers likely belong in `fireux-core` before tenant-specific consoles can be built here.

## Next Actions

- [ ] Coordinate with core/Misebox package owners to surface recipe, supplier, prep-plan, and analytics composables.
- [ ] Scaffold placeholder routes and navigation for the promised sections to unblock UI work.
- [ ] Define Firestore schemas (recipes, suppliers, prep runs, training modules) and seed data for tenant environments.
- [ ] Implement MVP UIs for recipes, prep plans, suppliers, and team training.
- [ ] Add analytics collection hooks (events or Firestore aggregations) to support consoles.
- [ ] Revisit literature after MVP to ensure wording matches shipped functionality.
