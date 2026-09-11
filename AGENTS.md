# AGENTS.md

Purpose: short operating gate and scope router for `fireux-mono`.

Effective: 2026-09-11

## Mandatory Entry

For every repository task:

1. Read this file and [global context](docs/ai/gpt-context.md) completely.
2. Read [repository hierarchy](docs/concepts/fireux-mono.md), then only the
   scoped contexts and maps relevant to the task below. Read all applicable rows.
3. Before editing, inspect `git status`, current owning source, package manifests,
   Nuxt modules/native layers where relevant, real consumers, the nearest working
   sibling, and available checks.

Current source and executable checks establish behavior; documentation routes
into that evidence. The human retains product authority. Resolve unclear
ownership before placing code, preserve unrelated work, and report verification
limits. Detailed working rules live in the global context:
[new work](docs/ai/gpt-context.md#new-work),
[task execution](docs/ai/gpt-context.md#task-execution),
[verification](docs/ai/gpt-context.md#development-and-verification),
[evidence claims](docs/ai/gpt-context.md#evidence-claims), and
[living-context maintenance](docs/ai/gpt-context.md#living-context-maintenance).

## Scope Router

This is the only repository routing table. A routed document does not replace
inspection of source, consumers, siblings, and available tests.

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
| Main App identity, landing, or pricing literature | `docs/ai/identity-literature-context.md` |
| Brand assets | `docs/concepts/brand-assets.md` |
| Documentation roles or new durable docs | `docs/concepts/documentation.md` |
| Apps That Slap | `docs/ai/apps-that-slap-context.md` |
| BuenoHost | `docs/ai/buenohost-context.md` |
| Sharer | `docs/ai/sharer-context.md` |
| Landing templates or the starter App | `docs/ai/templates-context.md` |
| Werkbox | `docs/ai/werkbox-context.md` |
