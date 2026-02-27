# Granite (FireUX Ecosystem) - Codex Thread

Status: Planning -> Build (Phase 0+1 scaffold implemented)
Owner: FireUX
Primary stakeholder: Scot Beaman
Tagline: Rock Solid OS for portfolio landlords

## Feasibility (Codebase-validated)
- Granite is fully feasible in current FireUX architecture.
- `fireux-granite` ecosystem package is mandatory because `defineFireuxConfig` auto-loads `fireux-${ecosystem}`.
- Landlord domain does not exist in current extensions, so new modules are required.

### Required modules for Job One
1. `packages/ecosystem/fireux-granite` (thin ecosystem shell)
2. `packages/extensions/fireux-properties`
3. `packages/extensions/fireux-compliance`
4. `packages/extensions/fireux-documents`
5. `packages/extensions/fireux-tasks` (thin cross-domain cohesion stub)
6. `projects/granite/granite-app`

## Canon guardrails (locked)
- No silent fallbacks.
- Interface composables (`use*Interface`) are view-only adapters.
- Selection is explicit; no auto-pick of first/latest entity.
- Null/missing data is surfaced explicitly in UI.

## Module boundary rule (locked)
`fireux-granite` stays thin:
- Owns shell/layout/nav/runtime namespace/demo selector framing.
- Does not own landlord domain Firestore entities.
- Domain ownership stays in extensions (`properties/compliance/documents/tasks`).

## Runtime console contract (Granite)
- Runtime keys:
  - `runtimePortfolioId`
  - `runtimePortfolioMode`
- Modes in Phase 1:
  - `live`
  - `read-only`
- Selector surface:
  - `/portfolios`
- Console surfaces:
  - `/console/portfolio`
  - `/console/portfolio/properties`
  - `/console/portfolio/compliance`
  - `/console/portfolio/documents`
  - `/console/portfolio/tasks`

No-fallback behavior:
- If `runtimePortfolioId` is empty, console routes show explicit blocking CTA to `/portfolios`.
- No `?id=` console selection.
- No implicit first-portfolio fallback.

## Data path strategy (Phase 1)
Anchor:
- `portfolios/{portfolioId}`

Scoped:
- `portfolios/{portfolioId}/properties/{propertyId}`
- `portfolios/{portfolioId}/properties/{propertyId}/units/{unitId}`
- `portfolios/{portfolioId}/compliance-records/{recordId}`
- `portfolios/{portfolioId}/documents/{documentId}`
- `portfolios/{portfolioId}/document-links/{linkId}`
- `portfolios/{portfolioId}/tasks/{taskId}`

## Phase plan
### Phase 0 Bootstrap
- Ecosystem package scaffold and runtime namespace
- Granite app shell scaffold
- TS references/path aliases/scripts wiring

### Phase 1 Pitch Core
- Properties + Units
- Compliance expiry status board (`ok/dueSoon/overdue`)
- Document vault + explicit entity linking
- Tasks stub + compliance/documents task projection hooks
- Read-only demo scenario pack (explicitly selected)

### Phase 2 Operational depth
- `fireux-tenancies`
- `fireux-maintenance`
- `fireux-finance`
- optional `fireux-reporting` / `fireux-notifications`

## Job One deliverables
- `codex-threads/granite.md` (this file)
- `docs/granite/00-bootstrap.md`
- `docs/granite/01-modules.md`
- `temp/granite.md` linked to canonical docs
