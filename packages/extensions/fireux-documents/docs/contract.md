# fireux-documents Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-18
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `packages/extensions/fireux-properties/docs/contract.md`

## 1) Purpose
- Own Portfolio document vault records, document storage helpers, and document-to-entity link records.
- Provide document operation seams mounted inside the selected Portfolio console workspace.
- Document surfaces are operational Portfolio console surfaces, not root/public document browsing surfaces.

## 2) Core entities
- `Document`
- `DocumentLink`

## 3) Family rule
- `Document` and `DocumentLink` are Portfolio-scoped console operation records.
- Owner console:
  - Portfolio
- `Document` stores Portfolio document metadata and the storage pointer for an uploaded file.
- `DocumentLink` links a Portfolio-owned document to another Portfolio-owned target.
- They are not shared root entities.
- They must not introduce root `/documents`, `/document-links`, `documents/{documentId}`, or `document-links/{documentLinkId}` canon unless a future shared document decision explicitly changes this contract.

## 4) Collections + paths
- Live documents:
  - `apps/{appId}/portfolios/{portfolioId}/documents/{documentId}`
- Live document links:
  - `apps/{appId}/portfolios/{portfolioId}/document-links/{linkId}`
- Test documents:
  - `test-portfolios/{portfolioId}/documents/{documentId}`
- Test document links:
  - `test-portfolios/{portfolioId}/document-links/{linkId}`
- Demo source:
  - Portfolio demo/scenario data from `fireux-properties`

## 5) Canonical seams
- Models:
  - `models/document.model.ts`
  - `models/document-link.model.ts`
- Reads:
  - `composables/fireux/console/portfolio/operations/documents/fetch/usePortfolioDocuments.ts`
  - `composables/fireux/console/portfolio/operations/documents/fetch/usePortfolioDocumentLinks.ts`
- Mutations/storage:
  - `composables/fireux/console/portfolio/operations/documents/mutations/useDocumentCreate.ts`
  - `composables/fireux/console/portfolio/operations/documents/mutations/linkDocumentToEntity.ts`
  - `composables/fireux/console/portfolio/operations/documents/mutations/useDocumentStorage.ts`
- Validation/interface:
  - `composables/fireux/console/portfolio/operations/documents/utils/validation/validateDocumentLinkTarget.ts`
  - `composables/fireux/console/portfolio/operations/documents/utils/view/useDocumentInterface.ts`
- Console page:
  - `pages/console/portfolio/documents.vue`

## 6) Route surface
- Console:
  - `/console/portfolio/documents`
- No public Document routes are canon.
- No root Document collection/detail pages are canon.

## 7) Non-goals
- Do not treat uploaded documents as a global root document library.
- Do not move selected Portfolio document reads/writes under `fireux/firestore/portfolio/document`.
- Do not add root document identity, SEO, or public browse surfaces without a future shared-document decision.
