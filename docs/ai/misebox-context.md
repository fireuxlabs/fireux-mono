# Misebox GPT Context

Updated: 2026-08-28
Ref: 066bcc1c1
Role: living context
Scope: Misebox ecosystem and Apps

## Purpose

Route recurring Misebox work to the correct App, ecosystem, extension, source,
and guard without copying implementation inventories. This file inherits
`AGENTS.md` and `docs/ai/gpt-context.md`.

## Refresh process

Before each Misebox task:

1. Read `AGENTS.md`, `docs/ai/gpt-context.md`, and this file completely.
2. Read `docs/concepts/fireux-mono.md` and the smallest routed concept map.
3. Inspect `packages/ecosystem/fireux-misebox`, the relevant
   `projects/misebox/<app>`, installed extensions, real consumers, generated
   Nuxt registration, relevant guards, and `git status`.
4. Compare the nearest maintained Main/tenant App or Workspace sibling.

## Ownership

```text
Misebox App → fireux-misebox → domain extensions → fireux-core
```

- A concrete Misebox App owns deployment, routes/adapters, brand, SEO, App policy,
  and genuinely App-specific presentation.
- `fireux-misebox` owns Misebox identity and real composition reused across
  Misebox Apps. It does not absorb reusable domain behavior.
- Domain extensions own their Entities, capabilities, models, authority, UI,
  server behavior, and reusable Workspace implementation.
- Core owns product-neutral FireUX/Nuxt mechanics.

Tenant-specific branches, ids, defaults, and copied domain models do not belong
in the ecosystem package.

## Apps and Workspace

- `misebox-app` is the Main App. `/` deliberately opens the Kitchen Workspace;
  `/product` is the separate product landing surface.
- The Main App owns `/`, navbar/SEO framing, and App-specific Kitchen literature
  in `app/components/Workspace/Kitchen/{Info,Operations,Tools,Discovery}.vue`.
- `fireux-kitchens` owns `WorkspaceKitchenHero`, `WorkspaceKitchenAI`,
  `WorkspaceKitchen`, target loading, selection, creation, authority, and
  operational capability components.
- Kitchen-enabled tenant Apps receive the authenticated thin
  `/workspace/kitchen` doorway. Their `/` route and brand remain App-owned.
- Non-Kitchen Misebox Apps receive no Kitchen pages, components, plugins, or
  server handlers.
- An App declares `workspaces: ['kitchen']`; `fireux-misebox` conditionally
  installs `fireux-kitchens`. Apps do not repeat the extension module.

Registration is guarded by `scripts/guards/ecosystem.mjs`,
`runtime-registration.mjs`, and `workspace-pages.mjs`.

## Kitchen and Place

- Canonical Kitchen root is exactly `id`, `name`, `slug`, `status`, and
  `visibility`.
- A name-only Kitchen shell may use a generated id while being manifested.
- Same-id Place owns venue name, tagline/presentation, address/geo, media,
  classification, price level, currency/timezone, and business hours.
- Kitchen Team owns membership, roles, permissions, invitations, and mutation
  authority.
- Menus and Orders remain their own records beneath their proved owner.
- Operations is a Workspace grouping, never a generic stored field.
- Tables remain Front-of-House unless explicit ownership is proved.
- App-support and legacy Kitchen-root operational maps are migration preimages,
  not authority.

Read current Kitchen and Place models plus
`docs/concepts/family-workspace-entity.md`,
`docs/concepts/place-kitchen-media.md`, `docs/concepts/menu-ordering.md`, and
`scripts/guards/kitchen-entity.mjs`.

## Capability storage and migration

- Named capabilities live beneath `kitchens/{kitchenId}` only when readers,
  writers, authority, and consumers prove the exact owner and path.
- Fulfilment authority is `kitchens/{kitchenId}/fulfilment/policy` with singular
  `KitchenFulfilment` data. Runtime is child-only; retained root fields remain
  protected preimages until a separate export/deletion gate.
- Sproochli attachment authority is
  `kitchens/{kitchenId}/integrations/sproochli`; retained root/App copies remain
  preimages until their separate deletion gate.
- Do not create generic settings/config registries, redundant ids, stamps, or
  parallel models.
- Migration scripts are protected operational entrypoints, not runtime APIs.
  Audit, normalize, hash, preserve preimages, create only, verify, and delete
  only through a separate authorized gate.

Use `docs/ai/firestore-mutations-context.md` and the Firestore skill for any
Firestore work.

## Access, subscription, and privacy

- User-facing subscription vocabulary is Free, Professional, and Business.
- Role is separate: User, Admin, or Developer.
- Free and Professional ordinarily allow one owned Kitchen; Business allows
  multiple. Invited access to another Kitchen does not consume ownership
  capacity.
- Administrative/developer previews do not create domain authority exceptions.
- Protected operational data is absent from public Kitchen/detail projections.
- Client Firestore access remains denied where trusted commands own mutations.
- Public route visibility never implies public execution authority.

Pricing copy and gates must agree with `docs/concepts/product-language.md` and
current Core App-access source.

## KitchenAI

- KitchenAI is Misebox’s Kitchen coordinator over registered capability agents,
  evidence, and named tools.
- It never invents live operational facts or bypasses selection, subscription,
  authority, confirmation, or approval.
- Search-demand literature is not runtime evidence.
- A capability is agent-callable only when a registered tool and trusted command
  prove it.
- UI, context, inference, tool selection, confirmation, and mutation remain
  distinct responsibilities.

Current source has an unresolved ownership seam: Kitchen-extension Workspace AI
components call Misebox ecosystem `/api/workspace/kitchen/agent*` endpoints.
Do not deepen that implicit upward dependency. Before changing it, decide whether
Misebox owns AI composition mounted above Kitchen Workspace, or Kitchen receives
one explicit optional provider contract. Two real consumers are required before
creating shared provider infrastructure.

Inspect current source under Kitchen `components/Workspace/AI*` and
`models/operation-*`, Misebox `runtime/ai` and `runtime/server/agent/kitchen`,
and `scripts/guards/operation-tools.mjs`.

## Product literature and Demo

- Derive copy from current capability source, not a parallel marketing vocabulary.
- `/` remains product-first but keeps stable server-rendered Kitchen Workspace
  meaning and internal discovery links.
- App Tools/Operations/Discovery components are literature and doorways;
  execution remains with the owning capability.
- Public Demo/Product Demo is read-only presentation over package-owned
  deterministic fixtures. It never becomes Live/Test authority or writes data.
- Media, brand, SEO, translation, finance, jobs, blogs, and marketplace work read
  their named concept maps and owner source rather than expanding this context.

## Verification

For relevant changes:

- prepare/typecheck the Main App or affected tenant;
- verify one Kitchen App and one non-Kitchen App when registration changes;
- inspect generated component/plugin/server-route ownership;
- run focused guards and package builds;
- run full `pnpm guard` and `git diff --check`.

A green guard does not excuse a red maintained-App typecheck. Report both.

## Authority and maintenance

Current source and executable guards outrank this context. Update this file only
when a stable recurring Misebox ownership, authority, language, or verification
boundary changes. Keep task state, migration counts, fixture inventories, route
dumps, and chat history out. Point to owning source and guards instead.
