# FIReUX Ecosystem — Literature

FIReUX is a modular SaaS framework that powers multi-tenant apps such as **Misebox** (hospitality professionals) and **Cleanbox** (cleaning workforce).
The system is composed of:

- **Core (`packages/core/fireux-core`)** — shared composables, auth, Firestore helpers, Stripe, PWA, CI.
- **Extensions** — optional feature sets:
  - `fireux-jobs`: jobs, applications, contracts, ratings.
  - `fireux-places`: business locations, verification, linking.
- **Tenants** — vertical modules built on core:
  - `fireux-misebox`
  - `fireux-cleanbox`
  - `fireux-fireux` (default tenant)
- **Projects / Apps** — deployable front-ends:
  - Misebox App + Niederhorn example
  - Cleanbox App + Richie’s Reinigung example
  - FireUX App (marketing + docs portal)

### Guiding Principles

1. **Modular first** – every feature lives in its smallest possible package.
2. **Tenant-aware** – core handles auth, data, billing; tenants define branding + flags.
3. **Composable** – every data model exposes `useX()` composables.
4. **Ship-ready** – each app must run without backend edits once environment vars are filled.

### Feature Families

| Domain   | Features                                   |
| -------- | ------------------------------------------ |
| Core     | Auth, Firestore, Stripe, PWA, CI, Docs     |
| Jobs     | Postings, Applications, Contracts, Ratings |
| Places   | Search, Verification, Map, Linking         |
| Misebox  | Profiles, Recipes, Suppliers, Prep Plans   |
| Cleanbox | Crews, QA, Billing, Clients                |
| FireUX   | Governance, Marketplace, Scaffolding       |
