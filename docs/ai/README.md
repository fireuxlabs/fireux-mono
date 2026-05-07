# AI Context Docs
Authority: Tier3 (Non-authoritative)
Updated: 2026-05-07

- Purpose: generated AI handoff, thread continuity, and compact upload bundles.
- Durable source layer lives in `packages/core/fireux-docs/src/runtime/**` plus Tier1 canon docs.
- User-specific AI working preferences live in `docs/ai/gpt-context.md`.
- Git actions are user-owned: pasted support text is advisory, and Codex must not stage, commit, push, reset, rebase, checkout, branch, or rewrite history unless Deano directly asks for that git action.
- `docs/ai/**` is generated support context, not architecture authority.
- Chatcontext bundles should be rebuilt from current docs, recent commits, and active working-tree signals.
- If content conflicts with Tier1 or `fireux-docs`, Tier1 and `fireux-docs` win.
