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
4. Complete the mandatory [composition start check](docs/ai/gpt-context.md#mandatory-composition-checks)
   before implementation. Before reporting completion, complete its finish check.

Current source and executable checks establish behavior; documentation routes
into that evidence. The human retains product authority. Resolve unclear
ownership before placing code, preserve unrelated work, and report verification
limits. Detailed working rules live in the global context:
[new work and composition](docs/ai/gpt-context.md#new-work-and-composition),
[working and verification](docs/ai/gpt-context.md#working-and-verification-rules),
[evidence claims](docs/ai/gpt-context.md#evidence-claims), and
[living-context maintenance](docs/ai/gpt-context.md#living-context-maintenance).

## Scope Router

This is the only repository routing table. A routed document does not replace
inspection of source, consumers, siblings, and available tests.

| Working scope | Required context or map |
| --- | --- |
| FireUX platform or upstream framework integration | `docs/concepts/fireux.md`, then the relevant Nuxt, Nuxt UI, or Firebase map |
| Repository or package ownership | `docs/concepts/fireux-mono.md`, `docs/concepts/lasagne.md` |
| App configuration or tenant/global/standalone roles | `docs/concepts/app-config.md`, `docs/concepts/family-tenant-global.md` |
| Runtime file placement or Nuxt registration | `docs/concepts/runtime-filesystem.md`, `docs/concepts/runtime-package.md` |
| Nuxt page, layout or route rendering | `docs/concepts/pages.md`, `docs/concepts/layouts.md` |
| Components or composition | `docs/concepts/components.md`, `docs/concepts/lasagne.md` |
| Family, canon, spine, alignment, or extraction | `docs/concepts/spine.md`, then the named family map |
| Workspace and Entity surfaces | `docs/concepts/family-workspace-entity.md` |
| Misebox Apps, ecosystem, or tenants | `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md` |
| Bären tenant or venue-specific operational decisions | `projects/misebox/baeren-ringgenberg/docs/ai/baeren-context.md` |
| Optional cross-ecosystem account connections | `docs/ai/account-connections-context.md` |
| Firestore mutations | `docs/ai/firestore-mutations-context.md` |
| Product copy or literature | `docs/concepts/product-language.md` |
| Main App identity, landing, or pricing literature | `docs/ai/identity-literature-context.md` |
| Brand assets | `docs/concepts/brand-assets.md` |
| App ignition and build reconciliation | `packages/extensions/fireux-ignite/docs/ai/ignite-context.md` |
| FireUX App Ignition requests and delivery | `projects/fireux/fireux-app/docs/ai/ignition-intake-context.md` |
| Industry research and capability discovery | `packages/extensions/fireux-ai/docs/ai/research-context.md` |
| Documentation roles or new durable docs | `docs/concepts/documentation.md` |
| Apps That Slap | `packages/ecosystem/fireux-slap/docs/ai/apps-that-slap-context.md` |
| BuenoHost | `packages/ecosystem/fireux-buenohost/docs/ai/buenohost-context.md` |
| Sharer | `packages/ecosystem/fireux-sharer/docs/ai/sharer-context.md` |
| Landing templates or the starter App | `docs/ai/templates-context.md` |
| Werkbox | `packages/ecosystem/fireux-werkbox/docs/ai/werkbox-context.md` |
