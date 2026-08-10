# pnpm concept map

Updated: 2026-08-04
Ref: d232cc731
Role: map, not canon

## Purpose

Explain workspace/package command context.

## Vertical links

- Parent: fireux-mono.md

## Horizontal links

- runtime-package.md
- app-config.md

## Workspace

- The repo uses pnpm workspaces.
- Root package manager is `pnpm@11.9.0`.
- The active repo Node pin is `22.23.1`; package engines require `>=22.23 <23`.
- Workspace globs are owned only by `pnpm-workspace.yaml` and cover exactly
  Core, Extension, and Ecosystem package lanes, two-level project packages,
  and tools. Static harnesses without a package manifest are not workspace
  packages.
- Shared pnpm settings live in `pnpm-workspace.yaml`, not `package.json#pnpm`.
- Dependency install scripts are closed by default. The narrow
  `allowBuilds` map records every reviewed package with an explicit `true` or
  `false`; implicit or string-valued approvals are invalid.
- Workspace overrides keep framework packages with identity-sensitive types,
  including H3 events, on one resolved version.
- `scripts/_lib/runtime.mjs` rejects an installed virtual store outside the
  current checkout, missing direct workspace links, and split physical copies
  of identity-sensitive server packages before dev, guard, or deploy work starts.
- Runtime package manifests map one extensionless code subpath to authored
  `.ts` source, so client and server consumers use the same import form. The
  import-boundary guard locks the manifest projection and rejects `.ts`
  suffixes in consumer package imports.
- Shared Nuxt Vite config resolves Firebase Admin server subpaths through their
  supported CommonJS entrypoints, and the NuxtFire Admin fallback uses
  `createRequire`; the dependency-ownership guard protects both parts of that
  SSR interop boundary.
- Non-interactive scripts must not trigger implicit installs; `verifyDepsBeforeRun` is disabled.
- The private root owns tooling through `devDependencies`; deployable/runtime
  dependencies belong to the package or app that imports them.
- `tsconfig.base.json` owns one exact source-path alias family for every
  package manifest. Package leaf configs remain local, Nuxt Apps share
  `projects/tsconfig.projects.json`, and aggregate configs at package-family
  and project roots are retired.
- `scripts/_lib/app-registry.mjs` is authored App launch authority.
  `pnpm sync:dev-workspace` generates its root dev/kill script projection and
  the VS Code task/launch and toolbar App projections. Toolbar-only
  presentation choices live in `tools/vscode-fireux-toolbar/apps.presentation.json`;
  the generated `apps.js` is not authored source.

## Common commands

- `pnpm guard`
- `pnpm sync:dev-workspace:check` (read-only check of App registry projections)
- `pnpm guard:product-landing` (fast landing feedback; never replaces the
  complete guard)
- `pnpm build:packages`
- `pnpm build:nuxt-baseline`
- `pnpm audit:scripts`
- `pnpm audit:app-assets -- --ecosystem <key>`
- `pnpm firebase:rules:render` (read-only drift check; pass `--write` only for
  an intentional local artifact regeneration)
- `pnpm sync:misebox-public-card-snapshots -- --project <id> --database <id>`
  (dry-run the guarded Kitchen/Place-to-Menu display snapshot sync; Company
  roots are excluded)
- `pnpm gitsave`
  (current upstream base, Git hooks, and repository guards are mandatory and
  have no bypass flags; saving also stops if another task changes the shared
  checkout during verification)
- `pnpm --dir <package-or-app> exec tsc --noEmit`
- `pnpm --dir <app> exec nuxi typecheck`
- `pnpm dev:misebox`
- `pnpm dev:go-qr`
- `pnpm dev:la-tap-berne`

## Working rule

- Use focused checks while iterating.
- Every task that edits the repository runs `pnpm guard` before handoff.
- Do not repeatedly run expensive checks after every tiny exploratory edit unless the user asks.
- Root commands are supported entrypoints, not aliases for other root commands.
- CI and release gates call supported root commands directly. Package builds
  complete before the `fireux-blank` Nuxt production baseline so the app
  consumes built production exports.
- Documentation references do not keep scripts active; manual entrypoints are explicit and dry-run-first.
- Script lifecycle validates local file targets across every authored package manifest.
- Dev model-drift payloads remain diagnostic; data repair uses a reviewed named domain script.
- Direct imports cannot resolve accidentally through the root or a sibling
  workspace. Nested package manifests inside authored source are invalid.
- Supported app launchers leave an unknown or other-checkout occupied app port
  untouched. When every listener belongs to the same app workspace in the
  current checkout, the launcher verifies readiness and route contracts, then
  reports the healthy existing server as success instead of starting a
  duplicate. Use the explicit `pnpm kill:<app>` command only when replacing
  that server or giving the current terminal ownership is intentional.
- Dev route smoke retries one transport-only failure once so an in-flight HMR
  rebuild does not kill startup; received HTTP or body-contract failures remain
  immediate failures.
- Tracked third-party fixes live under `scripts/patches/` and are registered
  through `pnpm-workspace.yaml#patchedDependencies`; the lockfile records
  their hash.
