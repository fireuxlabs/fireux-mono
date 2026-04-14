# FIReUX Ecosystem — Roadmap
Authority: Tier2 (Operational)
Updated: 2026-03-16

Status legend: ✅ done · ⚙️ in progress · ❌ missing · 🧩 dependency

---

## Urgent Security Follow-up

- [ ] HIGH PRIORITY: define secure Firestore rules for the full system, including every named database (`fireux`, `misebox`, `cleanbox`, etc.), so new databases never default into broken or unsafe access.
- [ ] Add a repeatable deployment path for Firestore rules per named database, not just `(default)`.
- [ ] Replace temporary dev-open rules with proper auth-, role-, and membership-based read/write rules.
- [ ] Document the minimum required rules for core collections such as `apps`, `users`, `project`, and app membership subcollections.
- [ ] Add a setup check that fails when a new named database exists without aligned rules and indexes.
- [ ] Add a release preflight that checks runtime `databaseId`, deployed rules target, and index target all match before shipping.
- [ ] Add a public-surface contract: signed-out tenant pages must not require protected Firestore client reads to render.
- [ ] Capture the Cleanbox/Richies rules incident as the canonical warning against shipping named databases before rules are deployed.

## Wave 0 — Foundations

Define shared schema, feature flags, and naming.

- [ ] Create `/packages/config/feature-flags.json`
- [ ] Standardize collection names & composable patterns
- [ ] Document Firestore rules + indexes templates for `(default)` and all named databases

---

## Wave 1 — Extensions

**Places**

- [ ] Manual create/edit + verification badge
- [ ] Map explore + filters
- [ ] Linking + invites + audit

**Jobs**

- [ ] Models + CRUD composables
- [ ] Job detail + application flows
- [ ] Contracts + ratings + agent verification

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

- [ ] Cleanbox routes `/console,/qa,/billing,/clients,/reports`
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
