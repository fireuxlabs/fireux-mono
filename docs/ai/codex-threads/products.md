# FireUX - Products and Revenue (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: products.
- Audience: Codex agents implementing code and runtime changes.
- Priority: reflect current architecture direction without turning Tier3 notes into authority.

## Source Layers
- Tier1 canon: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`.
- Tier2 runtime docs: `packages/core/fireux-docs/src/runtime/README.md` and branch READMEs.
- Tier3 output: these thread files and the generated chatcontext bundle.

## Commit Window
- Start: 2026-04-16T00:00:00+02:00
- End: 2026-04-30T10:10:34+02:00
- Source: rebuild_refresh_2026-04-30

## Recent Signals
- 5f1e52b3d + cfbc559b5 expanded project demo scenario foundations and shared runtime scenario types (2026-04-23).
- a3f3ea978 + bbe934374 tightened FireUX canon wording around route ownership and runtime behavior (2026-04-27).
- 0d8384b4a + c9c18fd61 + ff47d716c aligned reserved route keys and runtime-contract direction for console/public routing (2026-04-27).
- 08bb61bc1 + 8596c4e2c + d5d151f32 + a9ae70f26 + 55fbe79c6 + f11d445bb + 28bc13bd7 re-labeled docs entry points, generated docs, and scoped agent context loading (2026-04-28).
- ac65efebc clarified console entity collection-path resolution and related supplier/property path behavior (2026-04-28).
- 9feb37142 + e433b44d7 + 3a7e14fde + dafe5743f refined generic console state, console index behavior, and domain adapters across kitchen/portfolio/supplier (2026-04-29).
- 8a01ded76 + d99d8bf3f refreshed FireuxDebugPanel and developer inspection surfaces around runtime state (2026-04-28/29).
- 80a901d6a + 70a400f0f + 1aae9ef88 aligned kitchen dishes/identity and project app console surfaces with the current console model (2026-04-30).

## Working Guidance
- Treat `packages/core/fireux-docs/src/runtime/**` as the durable runtime-doc source layer before rebuilding Tier3 context.
- Keep the mental model strict: layout is a dumb shell, core runtime owns generic console state, and domain runtimes are adapters.
- Map routing, selection, metadata, and collection-path changes back to Tier1 canon before editing pages or cards.
- Do not let generated chatcontext drift away from `fireux-docs`, Tier1 canon, or the actual working tree.

## Next Run Checklist
- Re-scan recent commits and the active working tree instead of replaying the prior bundle window.
- Refresh fireux-docs runtime READMEs first when architecture direction changed materially.
- Overwrite this file completely and regenerate the daily chatcontext bundle.

#end
