# Repository scripts

This directory contains permanent repository tooling. It is not an archive for
completed data work.

## Shape

- Top-level scripts are small, runnable commands used by `package.json`, CI, or
  documented operational workflows.
- `_lib/` owns reusable script mechanics. Library files are imported by commands
  and are not command-line entrypoints.
- `guards/` contains executable repository contracts run by `pnpm guard`.
- `firebase/` contains generated or deployable Firebase artifacts. Environment
  and product configuration remain with their owning package.
- `data/` is permitted only for an input or fixture used by a retained command.

## Lifecycle

Keep development, verification, generation, release, and deployment tooling.
Remove a migration, reconciliation, repair, inspection, or product-data script
after its one-off job is complete. Git history is the archive.

When a command needs shared behavior, extract only that behavior into `_lib/`.
Do not retain a product-specific helper library after its command is removed.

Every runnable script must have at least one current owner: a package command,
CI workflow, guard, or maintained document. `pnpm audit:scripts` reports scripts
whose lifecycle or ownership needs review.
