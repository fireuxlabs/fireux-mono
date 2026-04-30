# FireUX - Cleanbox ecosystem (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: cleanbox.
- Audience: Codex agents implementing code and runtime changes.
- Priority: reflect current repo architecture without turning generated notes into authority.

## Source Layers
- Tier1 canon: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`.
- Durable runtime docs: `packages/core/fireux-docs/src/runtime/**`.
- User AI working preferences: `docs/ai/gpt-context.md`.
- Generated handoff output: `docs/ai/chatcontext-YYYY-MM-DD.md`.

## Commit Window
- Start: 2026-04-16T00:00:00+02:00
- End: 2026-04-30T10:19:46+02:00
- Source: manual_weekly_rebuild_2026-04-30

## Recent Signals
- FireUX docs are now the durable runtime source layer: `packages/core/fireux-docs/src/runtime/**` documents runtime branches, concepts, stacks, and docs routes.
- `docs/ai/gpt-context.md` now carries Deano-specific AI working preferences; generated chatcontext remains a disposable handoff bundle.
- Console architecture is settling around `/console`, `/console/X`, and `/console/X/overview` with app-config `consoleFamilies` controlling visible families.
- The console mental model is strict: layout is a dumb shell, core runtime owns generic console state, and domain runtimes adapt kitchen, supplier, portfolio, and project.
- Project stack docs are active under `fireux-docs`, separating model truth from cross-layer runtime stack truth.
- Recent runtime work focused on console data/state helpers, collection path resolution, debug panels, kitchen dishes/identity surfaces, supplier catalogue, and project apps.
- Docs updates on April 28 labeled historical/generated documentation and reduced default agent context loading, so agents should prefer scoped source docs over broad bundles.
- Tier1 canon and runtime contract were updated around April 27 for route ownership, reserved route keys, and runtime behavior direction.

## Working Guidance
- Read `packages/core/fireux-docs/src/runtime/README.md` and relevant branch or concept README before relying on generated AI context.
- Treat `docs/ai/**` as Tier3 generated context; never let it override Tier1 canon or `fireux-docs` runtime docs.
- For console work, keep pages thin, layout generic, core runtime shared, and domain logic inside adapters.
- When code changes architecture, routing, metadata, console behavior, or model semantics, update `fireux-docs` first and regenerate chatcontext second.

## Next Run Checklist
- Re-scan commits and working tree using a fresh upper bound.
- Update `fireux-docs` first if source-layer docs are stale.
- Regenerate thread files and the compact chatcontext bundle after source docs are current.

#end
