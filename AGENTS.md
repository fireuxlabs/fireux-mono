# AGENTS.md

Purpose: single entry point for AI agents working in this repo.

Effective: 2026-03-02  
Repository: fireux-mono

## Documentation System (single source map)

### Tier1 (authoritative canon)
- `docs/fireux-canon.md`
- `docs/entity-creation.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`
- `packages/extensions/fireux-*/docs/canon.md`

Package `README.md` is overview, mission, and how-to by default, not authority. For new packages, `docs/canon.md` is the preferred Tier1 package authority name. Existing `docs/contract.md` remains Tier1 and should not be renamed only for naming consistency.

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
3. For package/app work, the nearest local `AGENTS.md`, `AI.md`, `README.md`, `docs/contract.md`, or `docs/canon.md` only when relevant.

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

## Scoped context hints
- Package and app roots have strict shape rules; do not add local `AGENTS.md` files there unless the guard allows it.
- `packages/core/fireux-core`: owns shared runtime primitives, config helpers, composables, models, utilities, layouts, and SEO/runtime endpoints. Do not pull in extension/app docs unless imports or the task require it.
- `packages/extensions/fireux-kitchens`: owns kitchen runtime domain, operations entities, kitchen console behavior, and kitchen-owned runtime surfaces. Use `docs/contract.md` for kitchen identity, collections, routes, console behavior, SEO, or mutations.
- `packages/extensions/fireux-suppliers`: owns supplier runtime domain, supplier console behavior, supplier-owned catalogue/product wrappers, and supplier-owned runtime surfaces. Use `docs/contract.md` for supplier identity, collections, routes, console behavior, SEO, catalogue/product wrappers, or mutations.
- `projects/misebox/misebox-app`: owns the Misebox global app shell, app config, app-local pages, content, assets, styles, scripts, deployment wiring, and enabled extension composition. Move shared domain changes into the owning package or extension.

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
- Work pattern-first:
  - before beginning development on a new app, package, route family, console surface, or reusable runtime seam, run the pre-dev gate: identify the owning docs/checklist, inspect the nearest sibling implementation, name the system-owned registration/generated surfaces, and only then edit
  - identify the family/concept before implementing
  - for entity, console, route, model, collection manager, or public surface work, name the family and nearest reference sibling before editing
  - if the user says `canon`, `align`, `family`, `spine`, or `drift`, run a family-alignment checkpoint before coding: list what must match, list accepted deltas, and only then patch
  - look for the repeated repo pattern hidden in existing apps/packages
  - follow the existing factory path before inventing a local path; templates, registries, generators, toolbar lists, workspace refs, guards, and sync scripts are part of the implementation, not optional polish
  - when a task says "new", first find the nearest documented creation checklist or existing sibling implementation and complete the whole registration/check loop
  - patch the shared family or documented canon before adding app-local deltas
  - do not treat documentation-only canon as implemented canon; verify the matching routes, config, app registry, file tree, and guard/check coverage
  - do not stop at a working page or package if the repo has derived surfaces for that thing; update or run the generator that owns those surfaces
  - if a shape is proposed or scaffold-only, label it that way instead of presenting it as current behavior
  - never remove an accidental working surface without adding or preserving the intended inspection/operation path when the user needs it
  - treat missing `useXFetch`, `useXCollection`, `useXInterface`, model, card, collection-manager, dashboard, or console seams as alignment clues
  - when a new reusable pattern is discovered, update `docs/fireux-canon.md` and the relevant `fireux-docs` runtime concept/branch doc
  - once a pattern has been settled in Tier1 canon, do not rediscover it from scratch in later turns; start from the documented pattern and only inspect code to verify drift
- Work anti-spaghetti:
  - turn broad requests into the smallest useful batch before editing
  - for unclear or messy runtime flows, define expected inputs, process, outputs, and failure states before writing code
  - a tiny behavior requiring a broad diff is a stop signal; report the missing seam instead of patching around it
  - do not patch on top of a misunderstood patch; simplify back to the smallest coherent seam, then rebuild forward
  - add new files only when they name a real reusable seam, not merely to hide complexity
  - prefer focused checks attached to the changed seam before running broad repo checks
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
