# AI Chat Context Bundle (2026-04-30)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Consolidated context for coding and product-support agents.

# docs/ai/gpt-context.md

# FireUX GPT Context

Authority: User-maintained GPT working context
Updated: 2026-05-04
Audience: ChatGPT / Codex / coding agents

## Purpose

This file captures user-specific working rules, shorthand, and active FireUX direction that may not exist in repo docs yet.

It should be kept small, current, and practical.

Generated chatcontext is for repo/project state.
This file is for how Deano wants the AI to work.

## Repo identity

Primary GitHub repo:

fireuxlabs/fireux-mono

When ChatGPT has GitHub connector access, use this repo first for FireUX questions.

Do not default to Deano's personal repositories when looking for FireUX.
Search/select the `fireuxlabs` organisation repo.

GitHub connector limits:
- sees pushed repo state
- may not see uncommitted local Codex changes
- for local work, Deano should paste Git Q / git diff / changed files

## User shorthand

### `$`

When Deano sends only:

$

or uses `$` at the start of a message, it means:

Read the repo / current code context before answering.

For Codex:
- inspect the relevant files
- do not guess from memory
- prefer current repo truth
- keep response concise
- avoid reading the whole repo unless needed

For ChatGPT with GitHub connector access:
- use `fireuxlabs/fireux-mono`
- inspect pushed repo state before answering
- do not pretend pushed GitHub state includes uncommitted local changes

For ChatGPT without repo access:
- ask for current code/context or use available uploaded/context files
- do not pretend to have repo state

## Working style

- Be token-sparing when Deano is coordinating with Codex.
- Replies are often meant to be pasted to Codex, not explained back to Deano.
- Prefer direct instructions, patches, or compact architecture decisions.
- Do not over-plan.
- Do not ask unnecessary confirmation.
- Simplicity beats over-engineering.
- FireUX should move forward in small safe steps.

## No silent fallback chains

- Do not use fallback chains to make missing required data look valid.
- Prefer explicit missing states such as `Missing title`.
- IDs are not display labels unless the model contract says they are.
- Route and identity fields must not silently fall back between slug, id, and name.
- Display fields should use the canonical field first; if missing, show a missing or empty state and surface a dev/debug signal where useful.
- Fallbacks are allowed only for harmless display resilience, not for identity, routing, ownership, source, permissions, or required business fields.
- TypeScript union pipes like `'live' | 'demo' | 'test'` are fine. The problem is runtime fallback chains using `||` or `??` to hide missing data.

Bad:

```ts
const title = name || shortName || id || 'Untitled'
```

Better:

```ts
const title = name
const displayTitle = title || 'Missing title'
const hasMissingTitle = !title
```

Bad:

```ts
const routeId = slug || id
```

Better:

Use the route identity declared by the entity contract only.

## Code delivery preference

When giving code:
- provide copy-pasteable continuous blocks
- do not scatter tiny fragments unless necessary
- if changing one file, prefer one complete replacement block or one clear patch block
- do not omit code between two required edits

## FireUX current mental model

FireUX has a generic console architecture:

- layout = dumb shell
- core runtime = generic console state
- domain runtime = adapter for kitchen / supplier / portfolio / project
- domain pages should stay thin
- shared core fixes are preferred over local divergence

Console runtime should not become domain-specific.

## Docs and context model

fireux-docs is the durable source layer.

chatcontext is a generated handoff bundle.

Correct flow:

Code changes
→ update fireux-docs
→ generate chatcontext
→ paste/share with GPT

Do not treat generated chatcontext as canon.

## Active priority

Current FireUX focus:

1. Finish console architecture
2. Stabilise demo/read-only/live data flows
3. Prepare Kitchen / Granite demos
4. Then push SEO/meta/public app metadata work

## Codex instruction

When this file changes, update it in place.

Keep it:
- short
- current
- practical
- free of stale project history

Always preserve terminal marker.

#end

# docs/ai/codex-threads/alignment.md

# Alignment Notes - useInterface composables
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: alignment.
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

# docs/ai/codex-threads/bringli.md

# FireUX - Bringli ecosystem (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: bringli.
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

# docs/ai/codex-threads/cleanbox.md

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

# docs/ai/codex-threads/design-system.md

# FireUX Design System - Codex Thread
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: design-system.
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

# docs/ai/codex-threads/droply.md

# FireUX - Droply module thread (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: droply.
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

# docs/ai/codex-threads/extensions.md

# FireUX Extensions - Recent Scan (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: extensions.
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

# docs/ai/codex-threads/fallback.md

# Fallback Policy
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: fallback.
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

# docs/ai/codex-threads/fireux-misebox.md

# FireUX - Misebox ecosystem (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: fireux-misebox.
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

# docs/ai/codex-threads/kitchens.md

# Kitchens Roadmap (FireUX)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: kitchens.
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

# docs/ai/codex-threads/monorepo-install-incident.md

# Monorepo Install Incident (2026-02-06)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: monorepo-install-incident.
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

# docs/ai/codex-threads/onboarding.md

# Onboarding Thread
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: onboarding.
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

# docs/ai/codex-threads/packages.md

# FireUX - Packages Map (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: packages.
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

# docs/ai/codex-threads/product-fulfillment.md

# Product Fulfillment Thread Handoff
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: product-fulfillment.
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

# docs/ai/codex-threads/products.md

# FireUX - Products and Revenue (Codex)
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: products.
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

# docs/ai/codex-threads/tasks.md

# Tasks
Authority: Tier3 automation context (Non-authoritative)
Updated: 2026-04-30
Audience: Implementation context for Codex agents.

## Scope
- Thread key: tasks.
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

#end
