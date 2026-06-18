Server API spine map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

Purpose:
Map server API boundaries and avoid duplicate provider/consumer jobs.

Vertical links:
- Parent: nuxt4.md
- Child: tool-provider.md
- Child: family-menu.md
- Child: create.md

Horizontal links:
- firestore-entity.md
- composables.md

Current server surfaces:
- Package APIs live under `src/runtime/server/api`.
- App APIs live under `server/api`.
- Server helpers live under `src/runtime/server/utils` or app `server/utils`.

Boundary rule:
- Provider tools provide tool behavior.
- Consumer apps store their own consumer data unless the provider is dogfooding its own tool.

Working notes:
- Use endpoint files with clear HTTP suffixes where present, e.g. `.get.ts`, `.post.ts`, `.options.ts`.
- Keep upload/storage endpoints small and explicit.
- Shared server primitives can live in package `server/utils` when used by multiple endpoints.
- Server create endpoints are valid when the create is a transaction that needs
  multipart upload, storage, provider credentials, or admin/server-only work.
  See create.md.

Open questions:
- Menu upload endpoints are still young and should be simplified around clear input/process/output.
