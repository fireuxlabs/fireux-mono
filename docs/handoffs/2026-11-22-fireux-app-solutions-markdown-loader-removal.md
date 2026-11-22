# FireUX App — Remove unused solutions.md loading path

**Date:** 2026-11-22  
**Repository:** `fireuxlabs/fireux-mono` · **Target:** `main`  
**Status:** Codex implementation handoff; no implementation changes made by this handoff.

## Operator decision and objective

During the top-down FireUX Core configuration audit, we identified an optional build-time parser for `app/solutions.md` that no maintained App currently uses. Remove that unconsumed path rather than reorganising the `src/config/` tree.

**Target outcome:** Standard FireUX App configuration continues to load authored `app/meta.ts` or explicitly supplied `app.meta`, and its SEO/runtime behaviour remains intact. It no longer searches for, parses, or merges `app/solutions.md`.

This is a bounded cleanup, **not** a redesign of App content, Nuxt assembly, Firebase integration, or the Core/Extension ownership split.

## Required repository preflight

Read `AGENTS.md`, `docs/ai/gpt-context.md` and its applicable scope maps (especially `docs/concepts/app-config.md`, `docs/concepts/core-models.md` and `docs/concepts/fireux-mono.md`). Check the current checkout and `git status`; preserve concurrent work. Inspect the current owner, real consumers, tests, and any maintained App templates *before editing*. The observations below describe the source at handoff time, not a guarantee about newer local edits.

## Inspected source and consumers

- `packages/core/fireux-core/src/config/app/meta-content-loader.ts`
  - **Keep:** `loadFireuxAppMetaContent`, which resolves `app/meta.ts` (or returns explicit metadata), verifies the `metaContent` export, and reports errors.
  - **Remove:** `loadFireuxSolutionsMarkdown`, `parseFireuxSolutionsMarkdown`, `mergeFireuxSolutionMarkdownContent` and their private helpers/types/imports when no longer used.
- `packages/extensions/fireux-app/src/config.ts`
  - `defineFireuxApp` currently calls `loadFireuxAppMetaContent(app.meta)`, then passes the result through `mergeFireuxSolutionMarkdownContent(..., loadFireuxSolutionsMarkdown())`, then into `resolveContentSeo` and private runtime meta.
  - Change to use `const metaContent = loadFireuxAppMetaContent(app.meta)` directly. Preserve the rest of the App assembly, SEO resolution, and `setRuntime` projection.
- `packages/core/fireux-core/src/test/meta-content.test.mjs`
  - Remove or replace only the test that compiles `parseFireuxSolutionsMarkdown` and validates Markdown checklist parsing. Keep tests of `defineFireuxMeta`, metadata contract, and ordinary authored literature.
  - Clean up the now-unneeded source-loading/transpilation test scaffolding if it has no other consumer.

Initial GitHub code search found `app/solutions.md` mentioned by the loader, not by a maintained App file. **Codex must repeat a full local repository search**, including unpublished/uncommitted files, templates, fixtures and docs, before removing the contract. If a real maintained consumer is found, report it and stop rather than silently deleting needed behaviour.

## Implementation steps

1. Inspect the current working tree, confirm source ownership and references, and report the source-backed intent before editing.
2. Search for `app/solutions.md`, `loadFireuxSolutionsMarkdown`, `parseFireuxSolutionsMarkdown`, `mergeFireuxSolutionMarkdownContent` and documentation/tests promising this convention.
3. Remove the Markdown-only parser, merge, filesystem check and dead imports/helpers from Core's loader.
4. Simplify `fireux-app/src/config.ts` so the existing `app.meta` / `app/meta.ts` path feeds SEO and runtime directly.
5. Remove obsolete Markdown-parser tests and update any directly affected documentation. Do not delete authored App metadata, solution records inside `meta.ts`, or ordinary solution presentation.
6. Run the nearest targeted tests, Core typecheck and affected App preparation/build checks where practical; inspect the actual App builder consumer after the change.

## Acceptance criteria

- No build-time read or merge of `app/solutions.md` remains.
- Authored `app/meta.ts` and explicit `app.meta` continue to load correctly.
- Existing solution content already defined in authored metadata is retained without alteration.
- `resolveContentSeo` and runtime meta receive the same authored metadata as before, absent the retired optional Markdown override.
- Relevant tests and typechecks pass, or exact failures are reported.
- No new replacement loader, registry, compatibility fallback, configuration folder restructuring or unrelated changes are introduced.

## Non-goals and guardrails

Do **not** reorganise `src/config/app`, `module`, `firebase/rules` or `privacy`. Do not change Firebase Rules, authorization, stored records, deployed resources, Nuxt/PWA defaults, or unrelated SEO behaviour. Do not push, deploy or run `pnpm gitsave` without the operator's separate authorization for the implementation changes.

## Completion report to the operator

Give the exact files changed, functions removed, local search results (including any real remaining consumers), commands and test results, and any unresolved blocker. Report FireUX ownership/consumer fit separately from functional verification. **Stop after this bounded cleanup** so the operator can continue the Core top-down audit.
