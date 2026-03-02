---
title: Orientation & Mission
status: draft
created: 2025-10-15
updated: 2026-03-02
---

# Orientation & Mission
Authority: Tier2 (Operational)
Updated: 2026-03-02

FireUX is an opinionated layer on top of Nuxt 4 + Firebase. Drop in a few env vars, add your branding assets, and you have a working app with profiles, consoles, and shared objects ready to extend.

FireUX is positioned as a multi-tenant modular SaaS platform. The goal is to launch and operate multiple branded apps per ecosystem from one shared platform core.

We are indie and unknown by default, so this chapter explains what FireUX is, why it exists, and how the repo is laid out so you can get moving fast.

This handbook pairs with the GitHub Spec Kit workspace (`.specify/`, `.github/prompts/`). Spec Kit holds live specs and plans; the handbook keeps the durable rules and architecture. When one changes, update the other.

## Mission & Pillars

- **Unified experiences**: ship consistent UX across branded apps while allowing each ecosystem to extend or theme the surface area it owns.
- **Ecosystem network effects**: shared professionals and jobs can flow across apps within the same ecosystem to help fill staffing gaps.
- **Source-first delivery**: every package exports `src/` only; builds happen at publish/deploy time so code review always sees the real source.
- **Single configuration path**: one way to compose Nuxt apps (`createFireuxConfig`) and one Firebase entry point (VueFire module) keeps behaviour predictable.
- **Accessible documentation**: humans and agents share this handbook for enduring guidance while Spec Kit tracks active specs and implementation plans.

## Repository Map

| Area                                | Description                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/core/fireux-core`         | Shared components, composables, config helpers, auto-registered UI primitives.                             |
| `packages/extensions/*`             | Optional feature slices (for example `fireux-places`, `fireux-jobs`) that layer on top of the core module. |
| `packages/ecosystem/*`              | Ecosystem bundles that select extensions and define cross-app behavior (branding defaults, sharing rules, capabilities). |
| `projects/<ecosystem>/<app>`        | Deployable Nuxt apps that wrap ecosystem modules through `createFireuxConfig`.                              |
| `scripts/`, `tools/`, `migrations/` | Automation, data backfills, and guard scripts for repo maintenance.                                        |
| `docs/copilot-documentation/`       | This handbook, appendices, ADRs, and links into package-level docs.                                         |

For historical context, refer to the migration notes in repo history; the previous documentation set was retired on 2025-10-15.

## How to Use the Handbook

1. Start here, then read Architecture → Configuration → Workflow.
2. Use appendices for quick references (commands, env tables, runbooks) once populated.
3. Put package-specific details beside the code under `packages/**/docs/`; the [package documentation map](./package-docs-index.md) links to each location.
4. When behaviour changes, update the matching chapter and link any ADR or package doc so decisions stay traceable.

## Working with GitHub Spec Kit

- Run Spec Kit commands (for example `/speckit.constitution`, `/speckit.specify`) to capture live requirements inside `.specify/`.
- Cross-link Spec Kit artifacts and handbook chapters when a spec becomes a lasting convention.
- Update `.github/prompts/` if command workflows change so agents get the right guidance in-editor.

## Definition of “Done” for Changes

- Code change is covered by lint, type-check, and, where applicable, tests or scripts.
- Documentation is updated in the matching chapter or package doc.
- If the change alters a decision, add or extend an ADR under `copilot-adr/`.
- Related automation (scripts, tasks) is recorded in the development workflow chapter.

Proceed to the [Architecture Snapshot](./copilot-02-architecture.md) for a look at how the platform layers interact.
