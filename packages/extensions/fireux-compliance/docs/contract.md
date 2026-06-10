# FireUX Compliance Contract
Authority: Tier1 (Package Contract)
Updated: 2026-05-18

## Canon
- `ComplianceRecord` is a Portfolio-scoped console operation record.
- Canonical owner: selected Portfolio console workspace.
- Canonical stored path: `apps/{appId}/portfolios/{portfolioId}/compliance-records/{recordId}` for live selected-Portfolio operations.
- Demo compliance rows come from Portfolio scenario data.
- No root `compliance/{recordId}` entity canon exists yet.

## Runtime Seams
- Selected Portfolio operation seams live under:
  - `composables/fireux/console/portfolio/Operations/Compliance/fetch/usePortfolioComplianceRecordCollection.ts`
  - `composables/fireux/console/portfolio/Operations/Compliance/utils/status/useComplianceStatus.ts`
  - `composables/fireux/console/portfolio/Operations/Compliance/utils/view/useComplianceInterface.ts`
- `pages/console/portfolio/compliance.vue` is the Portfolio console route surface.

## Boundaries
- Compliance composables should not live under `firestore/compliance` while they depend on selected Portfolio runtime.
- Compliance records may link to properties, units, documents, and tasks, but they remain Portfolio-owned operation records.
