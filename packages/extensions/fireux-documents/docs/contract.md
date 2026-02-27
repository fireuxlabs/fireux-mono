# fireux-documents Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`

## 1) Purpose
- Own document metadata, storage upload integration, and explicit document-to-entity links.

## 2) Core entities
- `Document`
- `DocumentLink`

## 3) Identity rule
- Documents and links are id-based and portfolio scoped.
- Link targets are validated explicitly; invalid target types/ids are rejected.

## 4) Collections + paths
- `portfolios/{portfolioId}/documents/{documentId}`
- `portfolios/{portfolioId}/document-links/{linkId}`

## 5) Routes
- `/console/portfolio/documents`

## 6) Surfaces
- Document vault list
- File upload flow
- Explicit entity linking flow

## 7) Runtime dependencies
- Runtime portfolio selection from `fireux-properties`.

## 8) Mutation entrypoints
- `useDocumentStorage`
- `linkDocumentToEntity(...)`

## 9) Non-goals
- No inferred or fallback link targets.
- No image-only assumptions in storage API.
