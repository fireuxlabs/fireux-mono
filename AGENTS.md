# AGENTS.md

Purpose: short operating router for AI agents working in `fireux-mono`.

Effective: 2026-07-22

## Mandatory Entry

For every task in this repo:

1. Read this file.
2. Read `docs/ai/gpt-context.md`.
3. If the task belongs to a durable scope with a matching context file, read that scoped file too.
4. Then inspect current source, nearest sibling, and relevant guards before editing.

`AGENTS.md` is intentionally short. It tells agents where to go; it should not become the whole repository rulebook again.

## Context Router

Use the smallest current context that fits the task.

- Repo-wide agent context: `docs/ai/gpt-context.md`
- Misebox-specific work: `docs/ai/misebox-context.md`
- Werkbox-specific work: `docs/ai/werkbox-context.md`
- Product literature and common tongue: `docs/concepts/product-language.md`
- Concept maps and family language: `docs/concepts/*.md`
- Source shape and executable authority: `scripts/guards/*`
- Package/app entrypoints: `src/module.ts`, `src/config/module/*`, `nuxt.config.ts`, `package.json`

Create a new `docs/ai/<scope>-context.md` only for a recurring product, ecosystem, package family, or dedicated chat that needs durable guidance outside the global file.

Every scoped context must inherit this file and `docs/ai/gpt-context.md`, define its purpose/scope/ownership boundaries/authority/refresh process/verification expectations, point to current source and guards, and exclude temporary task state.

## Working Rule

FireUX needs a solid spine more than another local exception.

Before editing an entity, console, route family, model, collection manager, public surface, module registration, server API, or reusable seam:

1. Name the family.
2. Name the nearest working sibling.
3. Name what must match.
4. Name what may differ.
5. Patch the smallest useful slice.

If a tiny behavior needs a broad diff, stop and report the missing seam.

## Literature Rule

Before writing product, Console, operation, help, empty-state, or landing copy,
read `docs/concepts/product-language.md`. Start at the smallest current source
atoms and work upward: each parent explains its children, and the landing
summarises the proven tree. Use the present tense for a source-defined release
capability. Do not invent slogans, benefits, or promises that the child source
cannot explain.

## App Brand Rule

Every App belongs to one brand-asset system. Its `defineFireuxConfig` must
declare exactly one `brand.owner`: `core`, `ecosystem`, or `app`. Core and
ecosystem ownership means deterministic projection from that owner's canonical
source; App ownership means a complete App-owned family with `approved` or
explicitly temporary `provisional` status. Never loan, copy, invent, or ignore
assets merely to satisfy the public-image guard. Keep the shared runtime
contract at `public/img/app/*`; change ownership through source, config,
materialization, and guards together.

## Authority Order

1. Current source code.
2. Executable guards and tests.
3. `docs/ai/*-context.md` living entrypoints.
4. `docs/concepts/*.md` maps.
5. README placeholders and old/deleted docs are not authority.

When context disagrees with source or guards, follow source/guards and update the relevant context in the same change when the new rule is stable.

## Performance Hygiene

- Default to one agent and targeted searches.
- Before handing off any repository edit, run `pnpm guard` against the current
  shared checkout. Focused checks are iteration feedback; they never replace
  the complete handoff gate.
- `pnpm gitsave` enforces a current upstream base, Git hooks, and all repository
  guards without bypass switches. It also refuses to save when the worktree
  changes during verification; wait for every active task to finish before the
  shared save.
- Avoid repeated checks of unchanged state.
- Reuse healthy existing dev servers; do not restart or kill them without a concrete reason.
- Use focused checks while iterating; broaden verification only when shared seams move.
- If context is dominated by historical output, checkpoint useful state and recommend a fresh task.

## Communication

When the user says `canon`, `spine`, `align`, `family`, or `drift`, state what must match, what may differ, the reference sibling, and the files you will touch before editing.

Be direct when the repo is drifting. The goal is a simpler, stronger FireUX spine.
