---
title: CI/CD & Releases
status: draft
created: 2025-10-15
updated: 2026-03-02
---

# CI/CD & Releases
Authority: Tier2 (Operational)
Updated: 2026-03-02

This chapter outlines the expected checks, pipeline stages, and release practices for the FireUX mono-repo.

## Pre-merge Checks

- `pnpm lint`
- `pnpm typecheck:packages`
- `pnpm typecheck:apps`
- Targeted unit tests (when present)

These commands are the minimum required before opening a pull request. Include their status in the PR body for visibility.

## Pipeline Stages (proposed)

1. **Install**: `pnpm install` with workspace pruning to validate dependency graph.
2. **Lint & Type**: run the commands above to catch structural or typing issues early.
3. **Build**: `pnpm build:packages` plus `pnpm nuxi build <app>` for each deployable app in scope.
4. **Assets & Upload** (future): push build artefacts to the hosting provider or package registry.
5. **Deploy** (future): trigger environment-specific deployments (preview → staging → production).

Document any deviations (e.g., app-specific build steps) in package docs and reference them here when pipeline automation catches up.

## Release Strategy

- `main` is the source of truth. Tag releases using `vYYYY.MM.DD-<descriptor>` once deployment automation is in place.
- Tenant apps should inherit versioning from the platform; avoid per-tenant version numbers unless an external system requires it.
- Record notable release changes in the package docs or Operations chapter (e.g., new migrations, infra changes).

## Rollbacks & Hotfixes

- Keep the previous deployment artefact available for rollback.
- Hotfix branches should fork from the tagged release commit, receive minimal changes, and merge back to `main` after deployment.
- Update this chapter with provider-specific rollback steps once deployment tooling is standardised.

## Outstanding Work

- Automate lint/type/build via CI (currently manual).
- Define deployment providers, secrets storage, and promotion rules.
- Add monitoring hooks to confirm deploy health (see Operations chapter).

Next: review UX guidelines in [UX & Component Conventions](./copilot-07-ux-conventions.md).
