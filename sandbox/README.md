# Sandbox

This folder is for **local experiments and snapshots** that you don’t want to thread through the real package build graph.

## What this is

- A flat, repo-root folder where we copy canonical model files into standalone “scratch” versions.
- A place to prototype changes, compare shapes, and write notes.

## What this is NOT

- It is **not** imported by any package.
- It is **not** part of TypeScript project references.
- It is **not** intended to ship.

## Git behavior

- `sandbox/**` is gitignored.
- `sandbox/README.md` is explicitly **not** ignored so we can keep usage notes in the repo.

If you want to track a sandbox file temporarily, either:
- Move it out of `sandbox/`, or
- Update `.gitignore` with a one-off allow rule (recommended only short-term).

## Current snapshot files

These are copies of the real model files at the time they were created/updated:

- `app.model.ts` → `packages/core/fireux-core/src/runtime/models/core/app.model.ts`
- `profile.model.ts` → `packages/core/fireux-core/src/runtime/models/core/profile.model.ts`
- `user.model.ts` → `packages/core/fireux-core/src/runtime/models/core/user.model.ts`
- `Agent.model.ts` → `packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts`
- `Professional.model.ts` → `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts`
- `Chef.model.ts` → `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts`
- `Supplier.model.ts` → `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts`

## Workflow: “sandboxing” technique

1) Copy the current canonical file(s) into `sandbox/`.
2) Make changes in `sandbox/` until the shape/idea is right.
3) When ready, apply the change back to the canonical file(s) (and update composables/ensure flows as needed).
4) Run `pnpm build:packages` (and optionally `pnpm guard`) to validate.

Tip: keep the `// FILE:` header accurate inside the sandbox copy so you always know the original source.

## Notes

- 
