# Codex handoff — README spine

Date: 2026-11-22
Status: Scoped documentation consolidation request, not a code-architecture migration.

## Goal

Create a short, coherent, **source-owned** README documentation path from the monorepo root into FireUX Core's configuration, while auditing current `docs/` material for content that properly belongs beside its owning source.

The user wants a **living description of what exists today**. Do not append layers of contradictory ideas, duplicate a responsibility across multiple files, or move code to suit a documentation structure. Git retains historical versions.

## Writing principles

- A parent README explains its own scope, introduces important immediate children and directs the reader onward. A child owns its detailed explanation. The parent may highlight something distinctive about a child without repeating it.
- Scope documentation to the lowest place that actually owns its meaning. A folder with a single package representing the same responsibility does not need duplicate READMEs at both levels.
- Read existing READMEs, source comments, scoped contexts, applicable concept maps, consumers and tests **before writing**. For every updated explanation: keep, revise/replace, relocate or remove; do not just append.
- One current explanation per concern; link elsewhere. State uncertainty as uncertainty. Historical discussions, drafts and handoffs are not current rules.
- Use native Nuxt terminology accurately. FireUX is a Nuxt-based SaaS framework integrating Nuxt UI and Firebase, not a replacement for those systems.
- Do not automatically add giant explanatory comments to every source file. Existing concise file comments are valid; only touch comments where they materially improve a local owner's clarity and avoid repetitions. Never add comments to formats that forbid them.
- Avoid changing runtime behavior, architecture, configuration contracts, imports, directory layout or public URLs during this documentation-only slice.

## First, review existing documentation ownership

The root `docs/` currently contains many concept maps, working contexts, handoffs and historical/review material. It should **not** become a second implementation tree.

Review relevant material at:
- `docs/concepts/app-config.md`: likely contains some App-config detail better owned by `packages/core/fireux-core/src/config/app/README.md` and related package entrypoints. Trace which parts are Core-owned, App-builder-owned or genuinely cross-cutting; do not move the whole file reflexively.
- `docs/concepts/fireux-mono.md`, `docs/concepts/fireux.md`, `docs/ai/gpt-context.md`: much of this is legitimately cross-repository and may remain central. Keep central instructions where there is no single source owner.
- `docs/concepts/documentation.md`: reconcile its current documentation policy with the source-owned approach instead of creating competing rules.
- `docs/handoffs/`, `docs/reviews/`, `docs/archive/`, `organization.md`: distinguish historical decision context from active rules. Report misplaced or duplicated literature rather than deleting history automatically.

Give an evidence-based shortlist of what belongs beside source, what stays central, and what is only historical. **Do not mass-migrate `docs/`.** Avoid making new README prose coexist with contradictory active concept guidance: update or link the minimal necessary current guidance for this slice.

## Bounded README path

1. `README.md` (root): rewrite as a very short monorepo abstract and navigation map. Link `AGENTS.md`, current priorities, repo architecture and direct important paths, **especially `packages/core/fireux-core/`**. A brief note on important root workspace files is fine. Remove dated audit/chat links from the entrypoint without deleting their historical sources.
2. `packages/README.md` (new): three children and relationship: Core = product-neutral framework and Nuxt/Firebase mechanics, Extensions = reusable domain/capabilities, Ecosystems = industry compositions and infrastructure bindings. Dependencies point down; Apps may compose Core and Extensions directly without an industry-specific Ecosystem. Link directly to `core/fireux-core/README.md`.
3. `packages/core/fireux-core/README.md` (existing): preserve its package-level purpose and concise navigation; improve only what is necessary. Do not add `packages/core/README.md` when it merely repeats the single `fireux-core` package.
4. `packages/core/fireux-core/src/README.md` (new): map `module.ts`, `config/`, `runtime/`, `types/`, `utils/`, `test/`. `module.ts` is Core's Nuxt module entrypoint; do not claim it performs the App builder's whole job.
5. `packages/core/fireux-core/src/config/README.md` (new): define the sibling scopes `app/`, `module/`, `firebase/`, `privacy/` without restating internals.
6. `packages/core/fireux-core/src/config/app/README.md` (new): describe App configuration support: types, validation, runtime projection, Firebase Web/VueFire integration, database identity/runtime override, Nuxt/Nitro/Vite/PWA/SEO helpers, and their actual consumers. Distinguish this directory from `fireux-app/src/config.ts`, which assembles concrete App Nuxt config.
7. `packages/core/fireux-core/src/config/module/README.md` (new): module registration and wiring helpers, including shared Ecosystem-to-Firebase binding, and its relationship to `src/module.ts`.

These paths are the first bounded slice, not a demand to document all packages or descend into Components, Docs UI, Rules or runtime implementation today. Do not build a README for every conceivable directory or a separate duplicate `config/firebase` guide without a proved independent need.

## Presentation boundary

The source README is authoritative for its owner. `fireux-docs` should eventually **present** source-owned literature through a developer-friendly UI rather than maintain rewritten explanations. Do not implement a docs rendering pipeline or source-comment extractor in this task.

## Verification

- Confirm every new/changed README describes actual existing directory contents and responsibilities; verify links and direct consumers. Validate scope boundaries against source. Note where existing concepts still need future reconciliation.
- Check Markdown and `git diff --check`. Summarise exactly what was created, revised, removed from current prose, and explicitly left untouched.
- Do not modify implementation or delete historical content. Do not commit or push unless there is explicit authorization from the developer at execution time. Stop after documentation changes and report verification.

**Success:** a fresh agent starts at root, discovers Core immediately, follows an unambiguous path to Core's Nuxt module and config/App/Firebase owners, and reads one current explanation per concern instead of conflicting literature dumps.
