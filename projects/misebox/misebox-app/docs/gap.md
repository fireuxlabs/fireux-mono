# Gap Analysis

Comparison between the promises in `liturature.md` and the current Misebox app codebase (`projects/misebox/misebox-app`).

---

## 1. Features

- [❌] Professional chef profiles (creation, viewing, sharing) — no profile data models, pages, or components.
- [❌] Verified work history with references/reviews — no storage or UI for references.
- [❌] Recipe management (cost, scaling, portion control) — no recipe-related logic or interfaces.
- [❌] Kitchen prep planning tools — no prep-plan data structures or UI flows.
- [❌] Supplier integration / inventory re-ordering — no supplier or inventory management implementation.
- [❌] Job search / temporary placement system — no jobs modules, routes, or API usage.
- [❌] QR portfolio sharing — no QR generation or profile sharing utilities.
- [❌] Analytics consoles for kitchens/professionals — no analytics collection or display.

## 2. Routes / Pages

- [✅] `/` — implemented as marketing landing page (`pages/index.vue`).
- [❌] `/get-started`
- [❌] `/professional`
- [❌] `/jobs`
- [❌] `/kitchens`
- [❌] `/recipes`
- [❌] `/suppliers`
- [❌] `/prep-plans`

## 3. Components

- [✅] Landing components (`LandingHero`, `LandingQuickPeek`, `LandingSolutions`, etc.) — exist and render marketing copy only.
- [❌] Profile forms / consoles — absent.
- [❌] Recipe editors, ingredient tables, costing widgets — absent.
- [❌] Prep-plan boards or scheduler components — absent.
- [❌] Supplier management UIs — absent.
- [❌] Jobs listing/application components — absent.
- [❌] Analytics charts / KPI widgets — absent.

## 4. Notes

- The current app is purely a marketing landing experience. All operational functionality (profiles, recipes, suppliers, jobs, analytics) must be implemented, likely drawing on shared logic from `fireux-core`, `fireux-misebox`, and related extensions.
- Before building tenant-specific UI here, shared data models and composables for recipes, suppliers, jobs, and analytics should live in `packages/ecosystem/fireux-misebox` or `packages/core/fireux-core` so other Misebox tenants can reuse them.
