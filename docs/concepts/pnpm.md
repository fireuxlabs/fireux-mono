# pnpm concept map
Updated: 2026-08-03
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
- Shared Nuxt Vite config resolves Firebase Admin server subpaths through their
  supported CommonJS entrypoints, and the NuxtFire Admin fallback uses
  `createRequire`; the dependency-ownership guard protects both parts of that
  SSR interop boundary.
- Non-interactive scripts must not trigger implicit installs; `verifyDepsBeforeRun` is disabled.
- The private root owns tooling through `devDependencies`; deployable/runtime
  dependencies belong to the package or app that imports them.

## Common commands

- `pnpm guard`
- `pnpm guard:product-landing` (fast landing feedback; never replaces the
  complete guard)
- `pnpm build:packages`
- `pnpm build:nuxt-baseline`
- `pnpm audit:scripts`
- `pnpm audit:app-media -- --ecosystem <key>`
- `pnpm firebase:rules:render` (read-only drift check; pass `--write` only for
  an intentional local artifact regeneration)
- `pnpm werkbox:security-contract` (read-only local attestation check; pass
  `--write` only after reviewing the exact trusted-source manifest changes;
  this never deploys either App)
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
