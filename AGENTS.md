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
- `docs/copilot-documentation/copilot-00-toc.md`
- `docs/dev/_manifest.md`
- `docs/reports/README.md`
- `docs/ecosystems/README.md`

### Tier3 (tooling/history, non-authoritative)
- `docs/ai/**`
- `.vscode/**`

If any Tier2/Tier3 doc conflicts with Tier1, Tier1 wins.

## Where to look first
1. `AGENTS.md` (this file)
2. `docs/README.md`
3. `docs/fireux-canon.md`
4. `docs/runtime-contract.md`
5. `docs/seo-canon.md`

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
