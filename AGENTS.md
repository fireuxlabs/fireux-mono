# AGENTS.md

Purpose: single entry point for AI agents working in this repo.

Effective: 2026-03-02  
Repository: fireux-mono

## Documentation System (single source map)

### Tier1 (authoritative canon)
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`

### Tier2 (operational docs)
- `docs/README.md`
- `docs/index.md`
- `packages/core/fireux-docs/src/runtime/README.md`
- `packages/core/fireux-docs/src/runtime/*/README.md`
- `docs/copilot-documentation/copilot-00-toc.md`
- `docs/dev/_manifest.md`
- `docs/reports/README.md`
- `docs/ecosystems/README.md`

### Tier3 (tooling/history, non-authoritative)
- `docs/ai/**`
- `.vscode/**`

If any Tier2/Tier3 doc conflicts with Tier1, Tier1 wins.

## Where to look first
1. The user task and any directly named files.
2. `AGENTS.md` (this file).
3. For package/app work, the nearest local `AGENTS.md`, `AI.md`, `README.md`, or `docs/contract.md` only when relevant.

## Context loading rules
- Do not read broad docs by default.
- Read Tier1 canon only when the task touches architecture, runtime contracts, routing, Firestore models, SEO, or cross-package behavior.
- Read `packages/core/fireux-docs/src/runtime/README.md` only when the task touches runtime documentation, reusable runtime surfaces, or cross-cutting runtime components/composables/models/pages.
- Never read `docs/ai/**` unless the user explicitly asks for history/context.
- Never treat Tier3 as authority.
- If more than a small, localized set of files seems required, stop and report the scope before broad inspection or editing.

## Default ignore zones for context loading
Do not inspect these folders unless the user explicitly asks for them, or the task is specifically about that folder:
- `docs/ai/**`
- `docs/reports/**`
- `scripts/reports/**`
- `temp/**`
- `mirror/**`
- `.vscode/**`
- `docs/copilot-documentation/**`

These folders may contain stale, generated, historical, or tool-specific material. They are not authority. If one of these files appears relevant, summarize why before using it.

## Runtime README Branch System
- `packages/core/fireux-docs/src/runtime/README.md` is the runtime docs entry point.
- `packages/core/fireux-docs/src/runtime/*/README.md` are the branch READMEs for each runtime surface:
  - `components/README.md`
  - `composables/README.md`
  - `models/README.md`
  - `pages/README.md`
  - `concepts/README.md`
- For cross-cutting runtime work, use the relevant branch README before relying on Tier3 context files.

Note: The repository `AI/` folder was moved to `docs/ai/`. See `docs/ai/` for AI-related notes, chat transcripts, and codex threads.

## Authoring rules
- Keep docs reusable and generic; avoid app-specific duplication unless truly unique.
- Prefer one operational guide over many near-duplicate guides.
- Use `Authority:` and `Updated:` headers in markdown docs.
- Markdown is allowed in:
  - `docs/**`
  - `packages/**/docs/**`
  - repo root (`README.md`, `AGENTS.md`)
  - `docs/ai/**` (Tier3 only)

## Working rules for agents
- Keep changes small and localized.
- Prefer automation and repeatability.
- Never exfiltrate secrets; use environment variables.
- Do not rewrite ADR history; add a new ADR if changing decisions.

## Alignment sprint mode (when requested)
- Do NOT run commands unless explicitly asked.
- Do NOT commit/push/create PR unless explicitly asked.
- Modify only files the user lists; if more are required, name them and stop for approval.
- No renames/moves unless requested.
- Keep diffs minimal; no unrelated cleanup.
- Work in batches (~10 files), summarize each batch.
