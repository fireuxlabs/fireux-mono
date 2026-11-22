# App configuration ownership

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

Concrete Apps own identity, selected capabilities, brand, public routes, and
deployment policy. Native `nuxt.config.ts` owns assembly. Native
`app.config.ts` owns presentation settings such as UI, navigation and theme.
FireUX adds explicit assembly defaults and runtime projection.

- [fireux-app](../../packages/extensions/fireux-app/README.md) owns standard
  assembly. [fireux-ecosystem](../../packages/extensions/fireux-ecosystem/README.md)
  adds shared Main App surfaces.
- A named Ecosystem supplies shared Firebase and SSR bindings. The App owns
  its Hosting target and release policy. [Core's configuration](../../packages/core/fireux-core/src/config/app/README.md)
  owns emulator routing, Admin initialization, SEO, and private/public
  runtime configuration. Keep secrets server-side and public metadata scoped.
- Authored product copy and approved assets stay with their App. A source
  literature contract or build-time option is separate from stored App identity.

## App entrance and optional Workspace

Apps choose their Home and optional Workspace entrance. The optional
[Workspace package](../../packages/extensions/fireux-workspace/README.md)
owns registration and resolves the configured destination. Enabled families
are separate from membership, record grants and command authority. Core
Dashboard remains available without Workspace.

## Public metadata reference

The [shared viewer](../../packages/extensions/fireux-app/README.md#public-metadata-reference)
uses the Core public projection. Each App owns its metadata route and
indexing policy. Private context and protected records stay outside that response.

## Tenant and standalone Apps

Roles and canonical Ecosystem relationships are described in the
[App family map](family-tenant-global.md). A Core-only consumer can compose its
needed module/layer and Extensions directly. The standard builders retain
their declared binding and role contracts.
