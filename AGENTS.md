# AGENTS.md

Purpose: Provide clear, machine-usable context and operating rules for AI agents working in this repo.

Effective: 2025-09-12

Repository: fireux-mono

Primary knowledge bases for agents:

- `./docs/copilot-documentation/` — handbook for repo-wide conventions, workflows, and historical context.
- `.specify/` and `.github/prompts/` — Spec Kit workspace for live specs, plans, prompts, and task flows.
  Imported human-oriented docs live under `./docs/copilot-documentation/imported/` and mirror their former locations.

Guidance for all agents

- Alignment

  - This is a mono-repo for FireUX projects (core packages, extensions, ecosystems, apps).
  - Prefer automation, repeatability, and minimal changes per commit.
  - Treat `docs/copilot-documentation` as the handbook for conventions and decisions, and `.specify/` as the source for active spec-driven work. Keep both in sync when workflows overlap.

- Where to look first

  1. `.specify/memory/constitution.md` once drafted for current Spec Kit principles and guardrails.
  2. `docs/copilot-documentation/copilot-00-toc.md` for the handbook table of contents.
  3. `docs/copilot-documentation/copilot-01-orientation.md` for mission and structure, followed by relevant chapters.
  4. `docs/copilot-documentation/` subfolders:
     - `copilot-adr/` Architectural decisions
     - `copilot-instructions/` Agent operating guides
     - `copilot-appendices/` References and troubleshooting
     - `imported/` Human docs migrated for agent use (source path noted at top of each file)

- Routing and decision tree

  - For Spec Kit-driven specs, plans, tasks, and implementations: work in `.specify/` using the prompts in `.github/prompts/` as the authoritative workflow.
  - For repo conventions, workflows, or historical decisions: start in `docs/copilot-documentation/` (not `imported/`).
  - If the task references a filename that used to exist outside `docs/copilot-documentation`, search `docs/copilot-documentation/imported/<former path>`.
  - If you need ecosystem- or app-specific info, search imported docs under `imported/packages/` or `imported/projects/` before asking for clarification.
  - Prefer up-to-date ADRs, Spec Kit artifacts, and instructions over legacy reports in `imported/`.

- Authoring conventions for agents

  - Keep changes small and localized; update or add docs under `docs/copilot-documentation` or `.specify/` where appropriate.
  - Markdown is allowed in `.specify/`, `.github/prompts/`, `docs/copilot-documentation/`, and repo root (`README.md`, `AGENTS.md`). Avoid introducing Markdown elsewhere without approval.
  - When importing new human docs, place them under `docs/copilot-documentation/imported/` with an agent header indicating the source path and date.

- Output style

  - Be concise. Use skimmable bullets. Include filenames in backticks.
  - When adding code, follow the repo’s TypeScript/Vue/Nuxt conventions.

- Guardrails
  - Never exfiltrate secrets. Prefer environment variable references.
  - Don’t delete or rewrite ADR history. Add a new ADR if changing a decision.

Index and shortcuts

- Core references

  - `docs/copilot-documentation/copilot-01-orientation.md`
  - `docs/copilot-documentation/copilot-02-architecture.md`
  - `docs/copilot-documentation/copilot-03-configuration.md`
  - `docs/copilot-documentation/copilot-04-platform-services.md`
  - `docs/copilot-documentation/copilot-05-development-workflow.md`
  - `docs/copilot-documentation/copilot-06-ci-cd.md`
  - `docs/copilot-documentation/copilot-07-ux-conventions.md`
  - `docs/copilot-documentation/copilot-08-operations.md`

- ADRs

  - `docs/copilot-documentation/copilot-adr/`

- Appendices

  - `docs/copilot-documentation/copilot-appendices/`

- Imported human docs
  - `docs/copilot-documentation/imported/` (mirrors prior paths). Use these as context when referenced by name.

Operating policy

- Agents may edit and create files under `docs/copilot-documentation` as needed (except ADR history edits; add new ADRs instead).
- Agents may author Spec Kit artifacts under `.specify/` and maintain associated prompts under `.github/prompts/`.
- Agents should ensure that only approved Markdown exists outside those directories (repo root `README.md`, `AGENTS.md`, Spec Kit folders, `.github/prompts/`).

Notes for VS Code agent-mode

- The setting `chat.useAgentsMdFile` is expected to be enabled; this file provides your top-level instructions.
- Treat this `AGENTS.md` as the root of truth for routing and conventions; prefer this over legacy docs.

Alignment sprint mode (when the user requests it)

- Do NOT run any commands unless explicitly asked (no build/typecheck/lint/tests; no `pnpm` tasks).
- Do NOT commit, push, create PRs, or run `pnpm gitsave` unless explicitly asked.
- Modify ONLY the files the user lists. If additional files are required, name them first and stop for approval.
- No renames/moves. No “while we’re here” improvements.
- Keep diffs minimal: avoid formatting sweeps, doc rewrites, and comment cleanups.
- Work in batches of ~10 files max. After each batch, summarize changes and list the files touched.
- Repo search policy: only use search within the provided file list (avoid broad repo scans).
