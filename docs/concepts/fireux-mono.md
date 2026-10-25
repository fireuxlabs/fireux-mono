# FireUX Mono repository map

Updated: 2026-10-25
Ref: ce2861c77
Role: map, not canon

## Purpose and navigation

Map the repository's package lanes and the shortest path from an App entrypoint
to its owning package. For the platform stack, start at
[FireUX](fireux.md). For Nuxt, Nuxt UI and Firebase behavior, use the official
upstream docs linked there and the focused FireUX maps.

- [Repository ownership](lasagne.md)
- [Runtime filesystem](runtime-filesystem.md)
- [Package contracts](runtime-package.md)
- [Workspace commands](pnpm.md)
- [App configuration](app-config.md)
- [Documentation roles](documentation.md)

## Workspace lanes

| Lane | Owner |
| --- | --- |
| packages/core | Shared FireUX and Nuxt foundations. |
| packages/ecosystem | Real cross-extension product composition and Ecosystem bindings. |
| packages/extensions | Reusable domains and capabilities. |
| `projects/*/*` | Concrete Nuxt Apps and the project starter. |
| tools | Local development and operational tools outside reusable runtime packages. |

A directory is a package only when it has its own package.json and is included
by pnpm-workspace.yaml. That workspace file owns the package globs. The
no-FireUX embed harness is a static project exception, not a reusable package.

## Dependency direction

Implementation remains with the lowest layer that owns its complete meaning
and authority:

- An App may consume an Ecosystem, Extension or Core directly.
- An Ecosystem may consume Extensions and Core.
- An Extension may consume lower Extensions and Core.
- Core depends on external libraries, not product packages.

An upper layer composes, configures, frames or adapts lower-owned behavior; it
does not copy it for a route. An Ecosystem does not need a placeholder
Workspace when no owned product surface proves one.

## Cold-reading path

1. Read AGENTS.md, global context and the smallest relevant scoped context.
2. Read the owning package manifest and Nuxt module entrypoint to establish
   dependencies and registration.
3. Start at the App route, layout, middleware or server adapter.
4. Follow the adapter into its package runtime and domain owner.
5. Follow imports downward. Compare the nearest real sibling and its available
   source-owned checks.

Use [runtime-filesystem](runtime-filesystem.md) to distinguish Nuxt discovery
entrypoints from domain owners. Do not infer authority from the route, visible
brand or folder name alone.

## Current repository sources

- package.json owns package identity, dependencies, exports and commands.
- pnpm-workspace.yaml owns workspace package globs and install-script policy.
- tsconfig.base.json owns package path mapping; project App TypeScript
  configuration is shared through projects/tsconfig.projects.json.
- tools/fireux-launcher/apps.mjs discovers Apps and their development ports from
  App-owned manifests and commands. It is a launcher, not a package registry or
  projection generator.
- Generated Nuxt output, dist and node_modules are not authored source.

Use [pnpm](pnpm.md) for current commands and workspace checks. Root scripts and
package-specific commands are source; do not duplicate their inventory here.

## Adding an App

Start from the nearest working App in the same Ecosystem. Inspect its manifest,
Nuxt configuration, runtime layers, routes and deployment configuration.
Declare its App and canonical Ecosystem identities, Firebase binding and App
brand through their existing owners. Reuse existing trusted initialization and
domain commands.

Follow [App configuration](app-config.md),
[brand assets](brand-assets.md), the relevant Ecosystem context and the
[platform map](fireux.md). Verify the changed App and its actual behavior; a
folder copy or green build alone does not prove ownership or authority.
