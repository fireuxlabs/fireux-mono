# pnpm concept map
Updated: 2026-07-21
Ref: 318378b20
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
- Workspaces include packages, projects, tools, and test packages.
- Shared pnpm settings live in `pnpm-workspace.yaml`, not `package.json#pnpm`.
- Workspace overrides keep framework packages with identity-sensitive types,
  including H3 events, on one resolved version.
- `scripts/_lib/runtime.mjs` rejects an installed virtual store outside the
  current checkout, missing direct workspace links, and split physical copies
  of identity-sensitive server packages before dev, guard, or deploy work starts.
- The dependency-ownership guard requires server-reachable workspace runtime
  value imports to end in `.ts`; erased type-only imports are exempt.
- Non-interactive scripts must not trigger implicit installs; `verifyDepsBeforeRun` is disabled.
- The private root owns tooling through `devDependencies`; deployable/runtime
  dependencies belong to the package or app that imports them.

## Common commands

- `pnpm guard`
- `pnpm build:packages`
- `pnpm build:nuxt-baseline`
- `pnpm audit:scripts`
- `pnpm audit:app-media -- --ecosystem <key>`
- `pnpm firebase:rules:render` (read-only drift check; pass `--write` only for
  an intentional local artifact regeneration)
- `pnpm sync:misebox-public-card-snapshots -- --project <id> --database <id>`
- `pnpm gitsave`
- `pnpm --dir <package-or-app> exec tsc --noEmit`
- `pnpm --dir <app> exec nuxi typecheck`
- `pnpm dev:misebox`
- `pnpm dev:go-qr`
- `pnpm dev:la-tap-berne`

## Working rule

- Use focused checks while iterating.
- Run broad checks when package shape, guard-covered structure, or shared runtime seams change.
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
