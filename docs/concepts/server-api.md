Server API spine map
Updated: 2026-06-29
Ref: 5906abfc7
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

Server spine:
- `server/api/**` follows the HTTP route and method surface. Registered module
  handlers should still live under `server/api` when they are request handlers.
- `server/utils/**` holds reusable server-only work grouped by family and
  workflow, not as a flat package drawer.
- Core utility buckets may be primitive buckets such as `auth`, `http`, `ids`,
  `records`, `uploads`, and `slug`.
- Domain utility buckets should name the visible family and server workflow,
  for example `menu/ai`, `menu/draft`, `menu/source`, `menu/public`,
  `menu/ordering`, and `menu/ownership`.
- Use top-level server folders such as `stripe` only for provider/runtime
  constants that are not a request handler and are not reusable helper logic.

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
- Avoid parked top-level `server/handlers` folders for API endpoints; route
  registration belongs in config, but the handler file itself should stay near
  the API route it serves.

Open questions:
- Menu upload endpoints are still young and should be simplified around clear input/process/output.
