pnpm concept map
Updated: 2026-07-20
Ref: 4c0a1c7ad
Role: map, not canon

<!-- Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: map the canonical command and script-lifecycle surface. -->
<!-- Concurrent edit — 2026-07-20 22:07 CEST — Repo Efficiency Pass 4 of 6: map read-only App media audit and guarded snapshot sync commands. -->

Purpose:
Explain workspace/package command context.

Vertical links:

- Parent: fireux-mono.md

Horizontal links:

- runtime-package.md
- app-config.md

Workspace:

- The repo uses pnpm workspaces.
- Root package manager is `pnpm@11.9.0`.
- The active repo Node pin is `22.23.1`; package engines require `>=22.23 <23`.
- Workspaces include packages, projects, tools, and test packages.
- Shared pnpm settings live in `pnpm-workspace.yaml`, not `package.json#pnpm`.
- Non-interactive scripts must not trigger implicit installs; `verifyDepsBeforeRun` is disabled.

Common commands:

- `pnpm guard`
- `pnpm audit:scripts`
- `pnpm audit:app-media -- --ecosystem <key>`
- `pnpm sync:misebox-public-card-snapshots -- --project <id> --database <id>`
- `pnpm gitsave`
- `pnpm --dir <package-or-app> exec tsc --noEmit`
- `pnpm --dir <app> exec nuxi typecheck`
- `pnpm dev:misebox`
- `pnpm dev:go-qr`
- `pnpm dev:la-tap-berne`

Working rule:

- Use focused checks while iterating.
- Run broad checks when package shape, guard-covered structure, or shared runtime seams change.
- Do not repeatedly run expensive checks after every tiny exploratory edit unless the user asks.
- Root commands are supported entrypoints, not aliases for other root commands.
- CI calls `guard` and `typecheck:packages` directly and checks script lifecycle.
- Documentation references do not keep scripts active; manual entrypoints are explicit and dry-run-first.
- Dev model-drift payloads remain diagnostic; data repair uses a reviewed named domain script.
