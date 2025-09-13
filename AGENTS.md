# AGENTS.md

Purpose: Provide clear, machine-usable context and operating rules for AI agents working in this repo.

Effective: 2025-09-12

Repository: fireux-mono

Primary knowledge base for agents: `./copilot-documentation/` (authoritative). Imported human-oriented docs live under `./copilot-documentation/imported/` and mirror their former locations. Outside of `copilot-documentation`, the only Markdown files should be `README.md` and this `AGENTS.md`.

Guidance for all agents

- Alignment
  - This is a mono-repo for FireUX projects (core packages, extensions, tenants, apps).
  - Prefer automation, repeatability, and minimal changes per commit.
  - Treat `copilot-documentation` as the canonical source for internal guidance, ADRs, conventions, and workflows.

- Where to look first
  1. `copilot-documentation/copilot-00-toc.md` for the table of contents.
  2. `copilot-documentation/README.md` for structure and expectations.
  3. `copilot-documentation/` subfolders:
     - `copilot-adr/` Architectural decisions
     - `copilot-instructions/` Agent operating guides
     - `copilot-appendices/` References and troubleshooting
     - `imported/` Human docs migrated for agent use (source path noted at top of each file)

- Routing and decision tree
  - If the task is about code behavior, conventions, or workflows: start in `copilot-documentation/` (not `imported/`).
  - If the task references a filename that used to exist outside `copilot-documentation`, search `copilot-documentation/imported/<former path>`.
  - If you need tenant- or app-specific info, search imported docs under `imported/packages/` or `imported/projects/` before asking for clarification.
  - Prefer up-to-date ADRs and instructions over legacy reports in `imported/`.

- Authoring conventions for agents
  - Keep changes small and localized; update or add docs under `copilot-documentation` where appropriate.
  - Do not create Markdown files outside `copilot-documentation` except `README.md` and `AGENTS.md`.
  - When importing new human docs, place them under `copilot-documentation/imported/` with an agent header indicating the source path and date.

- Output style
  - Be concise. Use skimmable bullets. Include filenames in backticks.
  - When adding code, follow the repo’s TypeScript/Vue/Nuxt conventions.

- Guardrails
  - Never exfiltrate secrets. Prefer environment variable references.
  - Don’t delete or rewrite ADR history. Add a new ADR if changing a decision.

Index and shortcuts

- Core references
  - `copilot-documentation/copilot-01-overview.md`
  - `copilot-documentation/copilot-02-structure.md`
  - `copilot-documentation/copilot-03-config.md`
  - `copilot-documentation/copilot-04-firebase.md`
  - `copilot-documentation/copilot-04-packages.md`
  - `copilot-documentation/copilot-05-dev-workflow.md`
  - `copilot-documentation/copilot-05-projects.md`
  - `copilot-documentation/copilot-06-firebase.md` (additional)
  - `copilot-documentation/copilot-06-ci-cd.md`
  - `copilot-documentation/copilot-07-conventions.md`
  - `copilot-documentation/copilot-07-dev-workflow.md`
  - `copilot-documentation/copilot-08-ci-cd.md`
  - `copilot-documentation/copilot-09-conventions.md`

- ADRs
  - `copilot-documentation/copilot-adr/`

- Appendices
  - `copilot-documentation/copilot-appendices/`

- Imported human docs
  - `copilot-documentation/imported/` (mirrors prior paths). Use these as context when referenced by name.

Operating policy

- Agents may edit and create files under `copilot-documentation` as needed (except ADR history edits; add new ADRs instead).
- Agents should not create Markdown files outside `copilot-documentation`.
- Agents should ensure that only `README.md` and `AGENTS.md` exist as Markdown at repo root; all other Markdown belongs under `copilot-documentation/`.

Notes for VS Code agent-mode

- The setting `chat.useAgentsMdFile` is expected to be enabled; this file provides your top-level instructions.
- Treat this `AGENTS.md` as the root of truth for routing and conventions; prefer this over legacy docs.
