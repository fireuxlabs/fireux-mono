# Server APIs

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

Use native Nitro/H3 entrypoints for bounded projections, trusted commands,
uploads and server-held provider credentials. Native HTTP mechanics belong to
Nuxt. FireUX's domain owner chooses the exact input, scope, authority and result.

## Endpoint contract

- Keep HTTP adapters thin. Parse inputs and derive App, database, actor and
  target from trusted runtime scope. Caller-provided IDs express intent and
  must be checked against that scope.
- Enforce current authority at the actual read or write. Admin SDK bypasses
  Firestore Rules, so browser visibility or an authenticated session alone
  cannot authorize a server operation.
- Project an explicit allowlist with truthful outcomes and HTTP status.
  Preserve upstream failure as failure. Raw Admin errors, secrets and
  private records stay off public surfaces.
- Named domain commands own validation and atomic writes or explicit
  recovery. Keep locale, role, defaults and associations with their domain.
  Use the [mutation context](../ai/firestore-mutations-context.md) for exact
  targets, operation classes and release or migration authority.

## API reads and refresh

Use the owning live reader for mutable projections. Core supplies the
[server transport](../../packages/core/fireux-core/src/runtime/server/README.md#api-reads-and-refresh)
and [Nuxt client reader](../../packages/core/fireux-core/src/runtime/composables/README.md#native-api-read-ownership).
Domains own their joins, dependency scopes, publication and DTOs. Keep
loading, absence, errors and scope changes distinguishable.
