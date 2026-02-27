# Gap Analysis

Comparison between the promises in `liturature.md` and the current Niederhorn codebase (`projects/misebox/niederhorn`).

---

## 1. Features

- [⚙️] Branded interface with Niederhorn theme — primary/neutral colors are set via `app.config.ts`, but no dedicated logo assets or typography overrides are present yet.
- [❌] Recipe cards with cost/scaling per menu item — no recipe data structures, components, or Firestore integrations exist.
- [❌] Prep plan board by kitchen station — no routes, components, or composables implement prep workflows.
- [❌] Supplier database with ingredient tracking — no supplier models, storage, or UI beyond a placeholder CTA.
- [❌] Team training modules for onboarding — no pages or components for training content or progress tracking.
- [❌] Internal notes/feedback system — no messaging or comment storage implemented.
- [❌] Analytics on ingredient usage/prep efficiency — no analytics consoles or data collection utilities.
- [❌] Link to Misebox Pro profiles — no navigation or integration referencing Misebox-wide professional profiles.

## 2. Routes / Pages

- [✅] `/` — implemented as the landing/console (`pages/index.vue`).
- [❌] `/recipes` — not present.
- [❌] `/prep-plans` — not present.
- [❌] `/suppliers` — not present.
- [❌] `/team` — not present.
- [❌] `/analytics` — not present.

## 3. Components

- [❌] Recipe listing/detail components — none found under `app/components` (directory absent).
- [❌] Prep plan board / Kanban components — not implemented.
- [❌] Supplier management components — not implemented.
- [❌] Training module views or reusable sections — not implemented.
- [❌] Analytics widgets or charts — not implemented.

## 4. Notes

- The Niederhorn app currently ships only a single landing page with CTAs pointing to nonexistent routes. Substantial feature work is needed across recipes, suppliers, prep planning, training, and analytics to meet the literature promises.
- Shared foundations (data models, Firestore access, composables) likely belong in `packages/ecosystem/fireux-misebox` or `packages/core/fireux-core` before tenant-specific UI is layered here.
