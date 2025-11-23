---
title: Orientation & Mission
status: draft
created: 2025-10-15
---

# Orientation & Mission

FireUX is a Nuxt 4 + Vue 3 mono-repo that powers multiple product experiences from a single platform. This chapter introduces the mission, guiding principles, and the high-level layout of the repository so new contributors can orient quickly before diving into deeper topics.

This handbook pairs with the GitHub Spec Kit workspace (`.specify/`, `.github/prompts/`). Spec Kit captures live specs, plans, and task flows; the handbook records durable conventions, architecture, and historical context. Keep both updated when work in one affects the other.

## Mission & Pillars

- **Unified experiences**: ship consistent UX across tenants while allowing each ecosystem to extend or theme the surface area it owns.
- **Source-first delivery**: every package exports `src/` only; builds happen at publish/deploy time so code review always sees the real source.
- **Single configuration path**: one way to compose Nuxt apps (`createFireuxConfig`) and one Firebase entry point (VueFire module) keeps behaviour predictable.
- **Accessible documentation**: humans and agents share this handbook for enduring guidance while Spec Kit tracks active specs and implementation plans.

## Repository Map

| Area                                | Description                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/core/fireux-core`         | Shared components, composables, config helpers, auto-registered UI primitives.                             |
| `packages/extensions/*`             | Optional feature slices (for example `fireux-places`, `fireux-jobs`) that layer on top of the core module. |
| `packages/ecosystem/*`                | Ecosystem bundles that select extensions and contribute tenant-specific pages/configuration.               |
| `projects/<ecosystem>/<app>`        | Deployable Nuxt apps that wrap tenant modules through `createFireuxConfig`.                                |
| `scripts/`, `tools/`, `migrations/` | Automation, data backfills, and guard scripts for repo maintenance.                                        |
| `copilot-documentation/`            | This handbook, appendices, ADRs, and links into package-level docs.                                        |

For historical context, refer to the migration notes in repo history; the previous documentation set was retired on 2025-10-15.

## How to Use the Handbook

1. Read the chapters in order: Orientation → Architecture → Configuration, etc. Each builds on context from the prior section.
2. Use the appendices for quick references (commands, environment tables, runbooks) once they are populated.
3. Package-specific details belong beside the code under `packages/**/docs/`; the [package documentation map](./package-docs-index.md) links to each location.
4. When updating behaviour, update the relevant chapter and link any supporting ADR or package doc so decisions stay traceable.

## Working with GitHub Spec Kit

- Run Spec Kit slash commands (for example `/speckit.constitution`, `/speckit.specify`) to capture live requirements inside `.specify/`.
- Keep Spec Kit artifacts and handbook chapters cross-referenced when a spec graduates into a lasting convention or workflow.
- Update `.github/prompts/` prompts if the command workflows change so agents receive the right guidance in-editor.

## Definition of “Done” for Changes

- Code change is covered by lint, type-check, and, where applicable, tests or scripts.
- Documentation is updated in the matching chapter or package doc.
- If the change alters a decision, add or extend an ADR under `copilot-adr/`.
- Related automation (scripts, tasks) is recorded in the development workflow chapter.

Proceed to the [Architecture Snapshot](./copilot-02-architecture.md) for a look at how the platform layers interact.
