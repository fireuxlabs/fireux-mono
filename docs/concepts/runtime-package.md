# Runtime package contract

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

Manifests own package names, direct dependencies, export surfaces and scripts.
The [README directory](../../README.md) leads to their owners. Native Nuxt
entrypoints, package registrations and domain roots follow
[runtime ownership](runtime-filesystem.md).

Core supplies shared mechanics and depends on external libraries. Extensions
can use Core and lower Extensions. Ecosystems compose Extensions and
infrastructure for App families. Direct Core and Extension use can work without
an Ecosystem or Workspace. The standard App builder has its own binding
requirements, documented with [App configuration](app-config.md).

## Registration steps

A native layer makes conventional Nuxt directories available. A module
handles only the explicit registration, options and policy it owns. Declare
the module and layer where the consumer needs both. Missing required native
layer configuration fails explicitly. There is no parallel FireUX discovery
system or need for empty hooks.

Package runtime TypeScript exports and `typesVersions` agree on extensionless
consumer imports. Explicit Vue and stylesheet imports retain their suffixes.
List every directly consumed package in the manifest. Keep existing export
contracts and prove discovery in generated Nuxt output. Verify a packed
consumer when changing production exports.

See [Core wiring](../../packages/core/fireux-core/src/config/module/README.md)
and [optional Workspace](../../packages/extensions/fireux-workspace/README.md)
for their actual installation and verification paths.
