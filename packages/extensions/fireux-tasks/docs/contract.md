# fireux-tasks Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`

## 1) Purpose
- Provide a thin shared task surface for Granite operational cohesion.

## 2) Core entity
- `Task`

## 3) Identity rule
- Tasks are id-based and scoped to a selected portfolio.

## 4) Collections + paths
- `portfolios/{portfolioId}/tasks/{taskId}`

## 5) Routes
- `/console/portfolio/tasks`

## 6) Surfaces
- Task list and status updates (`open`, `in_progress`, `done`).
- Projection helpers from compliance and document events.

## 7) Runtime dependencies
- Runtime portfolio selection from `fireux-properties`.

## 8) Mutation entrypoints
- `useTaskCreate`
- `useTaskUpdate`

## 9) Non-goals
- No implicit task creation from unseen events.
- No silent fallback portfolio selection.
