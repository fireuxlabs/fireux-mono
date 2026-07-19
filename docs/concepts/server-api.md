Server API spine map
Updated: 2026-07-19
Ref: a6fb7062d
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
- Server domain stacks may live directly under `src/runtime/server/<domain>`
  when the domain already has a named stack such as model/composables/routes.

Server spine:
- `server/api/**` follows the HTTP route and method surface. Registered module
  handlers should still live under `server/api` when they are request handlers.
- `server/utils/**` holds reusable server-only primitives grouped by family and
  workflow, not as a flat package drawer.
- `server/<domain>/**` extends an existing domain stack into server-only work.
  Menu is the current example because the domain already has `useMenu`,
  Menu models/storage, Menu routes, and Menu-specific server workflows:
  `server/menu/manifest`, `server/menu/payload`, `server/menu/source`, and
  `server/menu/ordering`.
- Core utility buckets may be primitive buckets such as `auth`, `http`, `ids`,
  `records`, `uploads`, and `slug`.
- Domain server buckets should name the visible family and server workflow,
  for example `menu/ai`, `menu/draft`, `menu/source`, `menu/manifest`,
  `menu/payload`, `menu/ordering`, and `menu/ownership`.
- Use top-level provider folders such as `stripe` only for provider/runtime
  constants that are not a request handler and are not reusable helper logic.
- Do not create a top-level domain folder only because a route is complicated;
  prefer `server/utils` until the domain has a named stack to extend.

Boundary rule:
- Provider tools provide tool behavior.
- Consumer apps store their own consumer data unless the provider is dogfooding its own tool.
- Shared identity writes may publish authenticated, idempotent App events
  through core server endpoints. Event facts do not choose notification
  recipients or delivery channels; those belong to subscribing consumers.

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
