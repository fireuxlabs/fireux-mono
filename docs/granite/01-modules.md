# Granite Module Map
Authority: Tier2 (Operational)
Updated: 2026-03-02

## Ecosystem shell
### `fireux-granite`
Owns:
- Granite console layout shell (`granite-console`)
- Granite nav grouping for console routes
- `runtimeConfig.public.fireux.granite` defaults
- Ecosystem pages (overview/dev)

Must not own:
- Firestore landlord domain models/collections
- Domain mutation logic for properties/compliance/documents/tasks

## Domain modules (Phase 1)
### `fireux-properties`
Owns:
- `Portfolio`, `Property`, `Unit`
- Runtime portfolio selection composables
- `/portfolios` selector surface
- Property console/detail surfaces
- Read-only demo scenario pack

Must not own:
- Compliance record status logic
- Document storage/linking
- Task lifecycle

### `fireux-compliance`
Owns:
- `ComplianceItemType`, `ComplianceRecord`
- Derived status monitor (`ok`, `dueSoon`, `overdue`)
- `/console/portfolio/compliance`

Must not own:
- Runtime selector source of truth
- Document storage implementation

### `fireux-documents`
Owns:
- `Document`, `DocumentLink`
- Generic file upload storage API (`useDocumentStorage`)
- Link validator + explicit linking API (`linkDocumentToEntity(...)`)
- `/console/portfolio/documents`

Must not own:
- Property/compliance entity lifecycle
- Task persistence model

### `fireux-tasks`
Owns:
- `Task`
- `useTaskCreate`, `useTaskUpdate`, `useTaskCollection`
- `useTaskInterface`
- Projection helpers from compliance/documents events
- `/console/portfolio/tasks`

Must not own:
- Compliance/document source records
- Portfolio runtime selector state

## Later modules (Phase 2)
- `fireux-tenancies`
- `fireux-maintenance`
- `fireux-finance`
- Optional split: `fireux-reporting`, `fireux-notifications`

## Cross-module API summary
- `fireux-properties`
  - `useRuntimePortfolioSelection()`
  - `useRuntimePortfolio()`
  - `usePortfolioInterface()`
  - `type RuntimePortfolioMode = 'live' | 'read-only'`
- `fireux-compliance`
  - `useComplianceStatus()`
  - `useComplianceInterface()`
- `fireux-documents`
  - `useDocumentStorage()`
  - `useDocumentInterface()`
  - `linkDocumentToEntity(...)`
- `fireux-tasks`
  - `useTaskCreate`
  - `useTaskUpdate`
  - `useTaskCollection`
  - `useTaskInterface()`

## Guardrails
- No hidden defaults.
- No silent fallback chains.
- Selection is explicit and user-driven.
- View interfaces are read-only adapters.
