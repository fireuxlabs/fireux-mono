# FireUX Tasks Contract
Authority: Tier1 (Package Contract)
Updated: 2026-05-18

## Canon
- `Task` is a Portfolio-scoped console operation record.
- Canonical owner: selected Portfolio console workspace.
- Canonical stored path: `apps/{appId}/portfolios/{portfolioId}/tasks/{taskId}` for live selected-Portfolio operations.
- Demo task rows come from Portfolio scenario data.
- No root `tasks/{taskId}` entity canon exists yet.

## Runtime Seams
- Selected Portfolio operation seams live under:
  - `composables/fireux/console/portfolio/Operations/Tasks/fetch/usePortfolioTaskCollection.ts`
  - `composables/fireux/console/portfolio/Operations/Tasks/mutations/useTaskCreate.ts`
  - `composables/fireux/console/portfolio/Operations/Tasks/mutations/useTaskUpdate.ts`
  - `composables/fireux/console/portfolio/Operations/Tasks/utils/projection/useTaskProjection.ts`
  - `composables/fireux/console/portfolio/Operations/Tasks/utils/view/useTaskInterface.ts`
- `pages/console/portfolio/tasks.vue` is the Portfolio console route surface.

## Boundaries
- Task composables should not live under `firestore/tasks` while they depend on selected Portfolio runtime.
- Task can link to compliance records, documents, or other Portfolio-owned targets, but that does not make Task a root entity.
