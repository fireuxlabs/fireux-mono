# fireux-projects

Project identity, access, readers, Team, Test, Calendar and Workspace presentation.
Apps select `fireux-projects/layer`; the FireUX ecosystem installs the module
when Project Workspace is selected. Core and the standard App bundle stay independent.

This is the existing FireUX Project system. Its data remains in the named
`fireux` database, with the same App membership and Project authority. The host
provides the existing HTTP adapters. FireUX-specific App creation and cross-system
Ecosystem coordination remain with the ecosystem and FireUX App.

See [the module](src/module.ts), [Project source](src/runtime/project) and
[package composition](../../../docs/concepts/runtime-package.md).

Run `pnpm --dir packages/extensions/fireux-projects test` and the package
TypeScript check after changes. Verify the consuming FireUX App when registration
or HTTP contracts change.
