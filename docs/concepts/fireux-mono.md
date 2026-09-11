# FireUX Mono concept map

Updated: 2026-09-11
Ref: 53fa40ee6
Role: map, not canon

## Purpose

Explain the repo as a workspace so agents do not rediscover the skeleton.

## Scope

- Root pnpm workspace.
- Package lanes.
- Project app lanes.
- Development and verification entrypoints.

## Vertical links

- Parent: ../../AGENTS.md
- Child: fireux.md
- Child: pnpm.md
- Child: runtime-package.md
- Child: app-config.md
- Child: app-ignition.md
- Child: sharer.md

## Horizontal links

- spine.md
- pages.md
- components.md
- composables.md
- demo-data.md

## Current shape

- `packages/core/*`: shared foundations.
- `packages/ecosystem/*`: ecosystem identity/config packages.
- `packages/extensions/*`: reusable domain packages.
- `projects/*/*`: concrete Nuxt Apps and the project template; the
  explicit no-FireUX embed harness is a static project exception, not a
  workspace package.
- `tools/*`: local tools.
- `packages/*/*/src/runtime/<entity>/demo`: entity-owned reusable Workspace Demo
  Data. Root `runtime/demo` is reserved for genuine cross-entity composition
  or package-owned record families without a declared Entity.
- `projects/*/*/app/demo`: app-owned workspace Demo Data.
- `temp/*`: ignored temporary work only, never authored source.
- `figma-export`: optional ignored local directory or symlink, never tracked.
- `mirror`: optional local comparison output, never source. Its former
  generation scripts have been removed.

## Repository ownership spine

Read composition from the product inward and dependencies toward lower owners:

```text
Concrete Apps
├── Ecosystem composition
├── Entity and parent-domain extensions
├── Shared domain primitives
└── Core foundations

Allowed dependency direction:

App ───────────────→ Ecosystem / Extension / Core
Ecosystem ─────────→ Extension / Core
Extension ─────────→ lower Extension / Core
Core ──────────────→ external libraries only
```

Not every dependency passes through every row. An App may consume an Extension
directly, and an Extension may consume a lower domain primitive. The invariant
is that a lower owner never imports its upper composer: Core does not import a
product package, an Extension does not import an Ecosystem or App, and an
Ecosystem does not import an App.

Implementation remains with the lowest layer that owns its complete meaning
and authority. Upper layers compose, configure, frame, or adapt it. They do not
copy the implementation merely because they expose the final route.

For a proved Workspace family, the App declares that product surface and its
App policy, the ecosystem installs the owning extension and owns only genuine
cross-extension entry composition, and the extension owns the Entity runtime,
authority, and capability routes. A thin App route or presentation may frame
that surface without becoming its reusable owner. An ecosystem with no proved
Workspace installs none; repository hierarchy does not require placeholder
Workspace symmetry.

This is the repository comprehension spine, not a replacement for the three
package lanes. `packages/extensions` contains both shared domain primitives
and entity/parent-domain packages; the owning package and its dependencies
determine its position. A primitive may still own an Entity: Place is a
canonical Entity and also supplies lower Place capabilities to several domain
packages.

The current package classification is:

| Repository role | Current packages |
| --- | --- |
| Core foundations | `fireux-core`, `fireux-docs`, `fireux-nuxtfire` |
| Shared domain primitives | `fireux-ai`, `fireux-demo`, `fireux-finance`, `fireux-go-qr`, `fireux-places`, `fireux-sproochli`, `fireux-translation` |
| Entity and parent-domain packages | `fireux-blogs`, `fireux-companies`, `fireux-compliance`, `fireux-documents`, `fireux-jobs`, `fireux-kitchens`, `fireux-marketplace`, `fireux-products`, `fireux-properties`, `fireux-reservations`, `fireux-suppliers`, `fireux-tasks` |
| Ecosystem composition | `fireux-bringli`, `fireux-buenohost`, `fireux-fireux`, `fireux-granite`, `fireux-misebox`, `fireux-sharer`, `fireux-slap`, `fireux-werkbox` |
| Concrete Apps | packages under `projects/<ecosystem>/<app>`; `projects/templates/fireux-template` is the project template |

Package role describes the primary dependency and ownership job. It does not
authorize an upper layer to absorb a lower owner's implementation, and it
does not require a package split merely because one package owns multiple
related Entities.

## Cold-reading path

A human or agent entering an unfamiliar scope follows this bounded path:

1. Read `AGENTS.md`, `docs/ai/gpt-context.md`, and the smallest applicable
   scoped context.
2. Read the owning package's `package.json` and `src/module.ts` to establish
   dependencies and Nuxt registration.
3. Start from the relevant Nuxt entrypoint under `pages`, `layouts`,
   `middleware`, `plugins`, or `server/api`.
4. Follow that adapter into `runtime/<entity>/<technical-role>` when one Entity
   owns the behavior, or the root technical spine when it is genuinely shared.
5. Follow imports toward lower owners using the allowed dependency direction
   above; never infer ownership from the final route or visible brand.
6. Verify the claim against the nearest working sibling and relevant source-owned tests.

If that path requires searching unrelated component, composable, or server
trees to discover the owner, classify the placement as drift or migration;
do not normalize the ambiguity in documentation.

## Working notes

- Root `package.json` owns workspace scripts.
- `pnpm-workspace.yaml` solely owns workspace package globs; do not duplicate
  them in `package.json#workspaces`.
- The five workspace lanes are exactly `packages/core/*`,
  `packages/extensions/*`, `packages/ecosystem/*`, `projects/*/*`, and
  `tools/*`. A directory does not become a package without its own manifest.
- `pnpm-workspace.yaml#allowBuilds` is the narrow install-script policy and
  every entry uses an explicit boolean.
- `tsconfig.base.json` is the root package-path authority. Each package keeps
  its leaf config, every Nuxt App extends `projects/tsconfig.projects.json`,
  and hand-maintained aggregate configs under package lanes or `projects/` are
  retired.
- Root `demo/` is rejected; Demo stays with its package or app owner and loads
  only when an owning workspace selects it.
- Test, simulation, dev, and public prototype content are separate from Demo.
- `tools/fireux-launcher/apps.mjs` discovers launchable Apps from their own
  package manifests and dev ports. `pnpm launcher` opens the desktop picker.
- Root dev shortcuts invoke App-owned commands directly. VS Code tasks,
  launch configurations, and `tools/vscode-fireux-toolbar/apps.js` are optional
  maintained shortcuts; no registry generator owns them.
- The former `scripts/` tooling and guard suite were removed. Do not restore
  them to satisfy old documentation. Run current package checks and tests.
- Project apps should not own shared package truth. Packages and apps declare
  their own runtime dependencies.

## Adding an App

Start with the nearest working App in the same ecosystem and inspect its
manifest, Nuxt config, runtime layers, routes, and deployment configuration.
Give the new App a package-owned dev command and an unused port. The desktop
launcher discovers it from that manifest; add editor shortcuts only when useful.

Resolve ecosystem and database ownership before implementing data access.
Reuse the current trusted initialization and domain commands. App brand and
configuration stay App-owned. Follow `app-config.md`, `brand-assets.md`, and
the relevant scoped context for those responsibilities.

Verify the affected App with prepare/typecheck/build and relevant behavior
checks. A folder copy, editor shortcut, or green build alone does not prove
that its product behavior and authority are correct.
