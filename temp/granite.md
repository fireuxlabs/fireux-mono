# Granite Feasibility Study (Codebase-Validated)

Date: 2026-02-27  
Repo: `fireux-mono`

## Canonical Granite docs (source of truth)
- `codex-threads/granite.md`
- `docs/granite/00-bootstrap.md`
- `docs/granite/01-modules.md`

Note: this `temp/granite.md` file is now a feasibility snapshot and link-out index.

## Executive answer
Granite is feasible in the current FireUX architecture, but **yes, we need new modules first**.

At minimum, Granite should start with:
- `fireux-granite` (ecosystem package; required to boot any Granite app)
- `fireux-properties`
- `fireux-compliance`
- `fireux-documents`

Then add:
- `fireux-tenancies`
- `fireux-maintenance`
- `fireux-finance`

Optional presentation modules (can be stubbed):
- `fireux-reporting`
- `fireux-notifications`

## Why this is required (based on current code)

1. Granite app cannot run without a Granite ecosystem package.
- `defineFireuxConfig` auto-injects `fireux-${ecosystem}` in Nuxt modules.
- Evidence: `packages/core/fireux-core/src/config/app/fireux.config.ts`
- If app ecosystem is `granite`, Nuxt will attempt to load `fireux-granite`.

2. Existing extensions do not cover landlord domain objects.
- Current extensions are:
  - `fireux-blogs`, `fireux-companies`, `fireux-drop`, `fireux-jobs`, `fireux-kitchens`, `fireux-orders`, `fireux-places`, `fireux-products`
- Evidence: `packages/extensions/*`
- There is no existing property/tenancy/compliance/maintenance/finance/doc-vault extension.

3. The architecture is designed for exactly this type of expansion.
- Extension-first pattern is canonical and stable.
- Evidence:
  - `docs/copilot-documentation/copilot-02-architecture.md`
  - `docs/copilot-documentation/copilot-instructions/extensions.md`
  - `packages/core/fireux-core/src/config/module/module-wiring.ts`

## Reuse map (what Granite can reuse immediately)

### Reuse as-is
- `fireux-places`
  - Address/place identity and place-linked metadata.
  - Good fit for property address normalization.
- `fireux-companies`
  - Contractor company identity pattern and card/profile UI patterns.
- `fireux-core`
  - Firestore CRUD composables (`useFirestoreRead/Create/Update/Delete`, `useDocumentUpdateBase`)
  - Runtime/nav/layout infrastructure
  - Stamping and app-context helpers

### Reuse as pattern (not domain reuse)
- `fireux-kitchens` read-only scenario architecture
  - Useful template for Granite demo/read-only pitch mode.
  - Evidence: `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/read-only-scenarios/`
- `fireux-orders`
  - Useful for mutation/composable style only.
  - Domain model is checkout/order lifecycle, not rent ledger or tenancies.

### Do not reuse for Granite domain logic
- `fireux-jobs`, `fireux-drop`, `fireux-products`, `fireux-blogs`
  - Domain mismatch to landlord operations.

## Module recommendation: required vs optional

| Module | Need for Granite start | Reason |
|---|---|---|
| `fireux-granite` (ecosystem) | Required | App boot dependency via `defineFireuxConfig` |
| `fireux-properties` | Required | Core domain anchor (portfolio/assets/units) |
| `fireux-compliance` | Required | High-value monitoring surface (expiry/overdue) |
| `fireux-documents` | Required | Certificates/leases/invoices require vault + links |
| `fireux-tenancies` | Next | Needed for rent schedules + ledger |
| `fireux-maintenance` | Next | Needed for work orders + contractor operations |
| `fireux-finance` | Next | Needed for expenses/income/cashflow |
| `fireux-reporting` | Optional stub | Can start as derived pages in finance/compliance |
| `fireux-notifications` | Optional stub | Can defer until reminder workflows are proven |

## Real repo constraints to account for

1. Ecosystem scaffolder exists; extension/app scaffolders do not.
- Available now: `pnpm create:ecosystem` (`scripts/create-ecosystem.mjs`)
- Not present now: `create:extension`, `create:app`
- Practical impact: extensions/apps will be manual scaffolds or copied from existing package patterns.

2. New modules require explicit TS/project registration.
- Update points typically include:
  - `tsconfig.base.json` path aliases
  - `packages/extensions/tsconfig.json` references
  - `packages/tsconfig.json` references
  - `projects/tsconfig.json` references (for new app)

3. Canon constraints must be enforced from day one.
- No silent fallbacks.
- Interface composables are view-only adapters.
- Selection must be explicit.
- Evidence:
  - `docs/fireux-canon.md`
  - `docs/runtime-contract.md`
  - `.specify/memory/constitution.md`

## Recommended Granite-first build shape

### Phase 0 (mandatory bootstrap)
- Create ecosystem package: `packages/ecosystem/fireux-granite`
- Create app shell: `projects/granite/granite-app`

### Phase 1 (fastest proof of "Rock Solid OS")
- Implement:
  - `fireux-properties`
  - `fireux-compliance`
  - `fireux-documents`
- Add a read-only demo scenario dataset (explicitly selected, no auto-default)

### Phase 2
- Add:
  - `fireux-tenancies`
  - `fireux-maintenance`
  - `fireux-finance`
- Keep reporting/notifications as thin stubs unless needed for demo narrative.

## Final feasibility verdict
- **Technical feasibility:** High
- **Architecture fit:** High
- **Need new modules first:** **Yes**
- **Minimum module set to start Granite correctly:** `fireux-granite` + `fireux-properties` + `fireux-compliance` + `fireux-documents`
