# AGENTS.md

Purpose: short operating gate for AI agents working in `fireux-mono`.

Effective: 2026-08-28

## Mandatory Entry

For every task in this repository:

1. Read this file completely.
2. Read `docs/ai/gpt-context.md` completely.
3. Read the smallest relevant scoped `docs/ai/*-context.md`.
4. Read `docs/concepts/fireux-mono.md` for repository hierarchy.
5. Inspect current source, package manifests, Nuxt registrations, real
   consumers, nearest working sibling, relevant guards, and `git status`
   before editing.

Current source and executable guards outrank documentation. Documentation is
the route into the system, not a substitute for inspecting it.

## Repository Hierarchy First

Every source file must have one predictable owner. Start with the repository
dependency law in `docs/concepts/fireux-mono.md`:

```text
Apps may depend on Ecosystems, Extensions, and Core
Ecosystems may depend on Extensions and Core
Extensions may depend on lower Extensions and Core
Core never depends on product packages
```

The owning layer keeps the implementation. An upper layer composes or adapts
it; it does not copy or absorb it. Apps own deployment, routes, configuration,
brand, and genuinely App-specific presentation. Ecosystems own genuine
cross-extension product composition. Extensions own reusable domains and
capabilities. Core owns proven product-neutral mechanics.

Before adding a file or abstraction, answer:

1. Which layer and package own this behavior?
2. What existing family and working sibling does it belong to?
3. Which lower capabilities does it reuse?
4. What must match, and what product difference may remain?
5. Can the requirement be implemented without a new system, registry,
   compatibility layer, pass-through wrapper, or duplicate owner?

If ownership cannot be answered from current source and dependency direction,
stop and report the ambiguity. Do not make a convenient local placement and
later describe it as architecture.

## Scope Router

Read the mandatory entrypoints above, then only the rows relevant to the task.
When several rows apply, read all of them. A routed document narrows the search;
it never replaces inspection of current source, consumers, siblings, and guards.

| Working scope | Required context or map |
| --- | --- |
| Repository or package ownership | `docs/concepts/fireux-mono.md`, `docs/concepts/lasagne.md` |
| Runtime file placement or Nuxt registration | `docs/concepts/runtime-filesystem.md`, `docs/concepts/runtime-package.md` |
| Components or composition | `docs/concepts/components.md`, `docs/concepts/lasagne.md` |
| Family, canon, spine, alignment, or extraction | `docs/concepts/spine.md`, then the named family map |
| Workspace and Entity surfaces | `docs/concepts/family-workspace-entity.md` |
| Misebox Apps, ecosystem, or tenants | `docs/ai/misebox-context.md` |
| Firestore mutations | `docs/ai/firestore-mutations-context.md` |
| Product copy or literature | `docs/concepts/product-language.md` |
| Brand assets | `docs/concepts/brand-assets.md` |
| Documentation roles or new durable docs | `docs/concepts/documentation.md` |
| Apps That Slap, BuenoHost, Sharer, templates, or Werkbox | the matching `docs/ai/*-context.md` |

Do not create a second router document. Add a scoped context only for recurring
scope-specific guidance that satisfies the context contract above. Add a
nested `AGENTS.md` only when a subtree has durable operational instructions
that apply to nearly every edit there and cannot be expressed by source,
guards, or an existing context. Never copy repository architecture into it.

## Smallest Useful Change

Patch one bounded vertical responsibility at a time. Move implementation,
registration, consumers, docs, and guards together when they form one
ownership cutover. Remove the retired path and empty directories in the same
slice. Preserve unrelated and concurrent work.

If a tiny behavior needs a broad diff, stop and report the missing seam.

For a pipeline proof, use only:

1. one temporary value or field;
2. one writer;
3. one reader; and
4. one plain visible result.

Do not turn a proof into a catalogue, framework, generalized API, compatibility
layer, or presentation system. Remove temporary proof code when it has served
its purpose.

## Evidence and Claims

`Aligned`, `canonical`, `fixed`, `complete`, and `done` are evidence claims.
Always qualify them as local, family, or repository scope and follow the full
contract in `docs/ai/gpt-context.md#alignment-and-completion-claims`.

A green build proves compilation. A green guard proves only encoded contracts.
Neither proves unaudited ownership or repository-wide canon. Never present a
bounded repair as completion of its parent task.

A user decision, correction, requirement, or acceptance criterion is product
authority for its scope. A request to try, preview, compare, or see how
something feels is an experiment; keep it reversible and do not canonise it in
living context or permanent guards before acceptance and source evidence.

## Documentation and Authority

Use this authority order:

1. current source;
2. executable guards and tests;
3. `docs/ai/*-context.md`;
4. `docs/concepts/*.md`;
5. README placeholders and historical material.

Follow `docs/concepts/documentation.md` before creating, renaming, or changing
the role of durable documentation. Do not create a new context or concept map
when an existing owner can hold the rule. Documentation records proved
decisions; it must not convert a plausible implementation into canon.

## Verification and Shared Work

- Run focused checks while iterating and full `pnpm guard` before handoff.
- `pnpm gitsave` requires a stable shared tree; never run it while another task
  is active or without the user's requested save.
- Reuse healthy dev servers. Do not restart or kill them without a concrete
  need.
- Preserve all unrelated uncommitted changes. Never revert another task's
  work to make a check pass.
- If concurrent edits prevent a clean full guard, report the exact transient
  failure rather than claiming a green handoff.
- When context becomes dominated by historical output, checkpoint the useful
  state and continue in a fresh task with explicit acceptance criteria.

## Communication

When the user asks to open source files in VS Code, use the terminal `code -r`
command. For a side-by-side comparison, open both files this way and use the
smallest VS Code split command needed; do not use computer-control tooling for
ordinary file opening or editor arrangement.

When the user says `canon`, `spine`, `align`, `family`, or `drift`, state before
editing:

- the alignment scope;
- the owner and reference sibling;
- what must match;
- what may differ;
- the exact files in scope; and
- what remains unaudited.

Be direct when the repository is drifting. Do not reassure beyond the evidence.
