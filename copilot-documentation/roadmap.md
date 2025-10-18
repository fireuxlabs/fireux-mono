# FIReUX Ecosystem — Roadmap

Status legend: ✅ done · ⚙️ in progress · ❌ missing · 🧩 dependency

---

## Wave 0 — Foundations

Define shared schema, feature flags, and naming.

- [ ] Create `/packages/config/feature-flags.json`
- [ ] Standardize collection names & composable patterns
- [ ] Document Firestore rules + indexes templates

---

## Wave 1 — Extensions

**Places**

- [ ] Manual create/edit + verification badge
- [ ] Map explore + filters
- [ ] Linking + invites + audit

**Jobs**

- [ ] Models + CRUD composables
- [ ] Job detail + application flows
- [ ] Contracts + ratings + employer verification

---

## Wave 2 — Tenants

**Cleanbox**

- [ ] Crew, Client, QA, Billing, Reports composables
- [ ] Theme tokens + feature toggles
- [ ] Seeder CLI

**Misebox**

- [ ] Profile, Recipe, Supplier, PrepPlan, Reference composables
- [ ] Theme tokens + seed data

---

## Wave 3 — Apps

- [ ] Cleanbox routes `/dashboard,/qa,/billing,/clients,/reports`
- [ ] Misebox routes `/professional,/jobs,/recipes,/suppliers,/prep-plans`
- [ ] FireUX app pages `/get-started,/developers,/projects,/pricing,/contact`

---

## Wave 4 — FireUX Tenant

- [ ] Tenant config schema & UI
- [ ] Auth + Billing pages
- [ ] PWA assets + legal pages

---

## Wave 5 — Core Promotion

- [ ] Finalize `useAuth,useTenant,useFirestoreRead/Write,useStripe,useAnalytics`
- [ ] CI + Stripe webhook presets
- [ ] Developer portal + auto-generated docs
- [ ] Automated tenant-switch tests

---

## Completion Criteria

- All tenants/apps build & deploy with one `createFireuxConfig()`.
- Each domain has live CRUD UI + schema docs.
- FireUX App publishes developer docs & marketplace.
