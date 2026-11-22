# Runtime ownership

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

FireUX keeps native Nuxt discovery and adds explicit ownership for runtime
implementation. Read the package's actual module, native layer and App
consumers before changing placement or a registered name.

## Native entrypoints and domain owners

The package runtime root hosts conventional Nuxt entrypoints plus genuinely
shared technical roles. Domain behaviour belongs under
`src/runtime/<entity>/<role>`. A first-class Entity gets a sibling root in
its owning package. A parent-owned Record may have a definition under
`records/`; its behaviour uses the Entity's existing technical roles. Route
grouping and storage nesting do not establish source ownership.

Keep reusable HTTP adapters under their package's native `server/api` and
App-specific ones under the App's route owner. Domain commands remain in
`<entity>/server`. Models, types and ordinary utilities use explicit imports.
Shared utilities need an independent reason and real consumers. Config and
runtime code share a lower helper only where both actually use it.

## Domain component surfaces

An Entity's `components/` holds public or reusable presentation and
`components/Workspace/` holds operator capabilities. Authentication on a
customer surface does not change its audience. Workspace folders reflect
actual navigation groups. A simple child can be a file.

The target operator name is `<Entity>Workspace<Capability><Child>`. Named
composable exports follow that order where they own meaningful coordination.
Public names and existing registration remain until a complete consumer
cutover. Reconcile the module, imports, overrides and generated registration
together. Use [Lasagne](lasagne.md) for local named children and
[Core components](../../packages/core/fireux-core/src/runtime/components/README.md)
for shared registrations.

## Workspace

[Workspace](../../packages/extensions/fireux-workspace/README.md) owns its own
selection, layout and registration. Domain Workspaces own their record readers
and commands. Ecosystems can compose shared domain capabilities without
changing the base package's ownership. See [Workspace](workspace.md) and the
[package contract](runtime-package.md).
