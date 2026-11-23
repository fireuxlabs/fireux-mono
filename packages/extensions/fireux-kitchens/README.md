# FireUX Kitchens

Updated: 2026-11-07
Role: package landing map, not canon

`fireux-kitchens` owns reusable Kitchen domain contracts, Workspace surfaces,
Tools and trusted server behaviour. Apps install and compose the package.
Follow the [repo working rules](../../../AGENTS.md). Start with the source owner
for the relevant Kitchen capability.

See the [Menu and service glossary](docs/menu-service-glossary.md) for Kitchen
terminology and the current customer/staff boundary.

## App ordering configuration

Apps opt into supported ordering channels through the native module tuple:

```ts
;['fireux-kitchens', { ordering: { channels: ['pos', 'kiosk', 'website'] } }]
```

`src/config/module/runtime-config.ts` validates and projects this to the existing
`public.ordering` contract. Omission enables no channels. Kitchen command authority,
service readiness and publication policy remain separate checks.

## Entity spine

Kitchen implementation lives in `src/runtime/kitchen/` beneath technical roles:
`components`, `composables`, `models`, `server`, `utils`, and the consumed `demo`
and `tools` roles. Conventional Nuxt entrypoints remain at the runtime root.
There is no aggregate `useKitchen` CRUD facade or supported root Delete action.

- `models/kitchen.model.ts`: the stored Kitchen root, composing capability
  configuration once, with creation and optional update stamps.
- `utils/read-kitchen-document.ts`: strict validation of Kitchen identity and
  root fields. Malformed Orders, Services or Tables maps are omitted from the
  read result. Valid maps remain available to their consumers.
- `composables/useKitchens.ts`: public HTTP directory.
- `composables/useKitchenCollection.ts`: live membership-bound roots and Place
  presentation; invalid roots fail the collection without a partial list.
- `composables/useKitchenRead.ts`: validated live root and same-ID Place read.
- `composables/useKitchenCreate.ts`: named directory/onboarding client entrances.
- `composables/useKitchenUpdate.ts`: typed update/publication adapter
  to `/api/workspace/kitchen/update`, with captured input and account/App scope.
- `composables/workspace/useKitchenWorkspace.ts`: selection, access-bounded
  current root and its collection-owned access. Creation and named updates retain
  their separate adapters; Workspace owns no alternate CRUD lane.
- `components/Identity/ListingEdit.vue`: one listing editor shared by Identity
  and Home. Identity route context belongs to its route; Overview consumes the
  supplied identity projection without a Team acquisition.
- `server/identity/update.ts`: sparse trusted root edits, atomic slug uniqueness
  and server audit stamps. `archived` remains supported.
- `server/index/onboarding/`: directory, account, guest and adoption workflows.
- `tools/`: consumed Tool definitions; protected executors live under `server/`.

## Kitchen-only Workspace

The [local independence checkpoint](../../../docs/reviews/2026-11-22-kitchen-items-architecture.md#independence-proof-closeout)
verifies this opt-in composition. Checked-in Apps use their existing Kitchen
composition. Adoption of the narrow mode as a supported App configuration
still needs a product decision.

Install `['fireux-kitchens', { workspaceOnly: true }]` with the
[Workspace module and layer](../fireux-workspace/README.md#registration), and
declare `kitchen` in the App's `workspaces`. This mode adds the Kitchen
Workspace route and its create and update endpoints. It omits the full
Kitchens layer and ordering options. Core owns sign-in.

The [Kitchen page](src/runtime/kitchen/pages/workspace.vue) reads the selected
Kitchen without Place hydration and reconciles the saved selection against
settled grants. The name lives on `Kitchen.identity.name`. The standard
Misebox installation retains its Place-backed onboarding path.
The base update endpoint accepts identity fields in Kitchen-only mode. The
full installation retains its validated Services and Tables settings writes.

Add `workspaceItems: true` alongside `workspaceOnly: true` to opt into
the [Items route](src/runtime/kitchen/pages/items.vue). It lists Items from the
selected Kitchen, supports name-only creation and editing, and opens each Item
at `/workspace/kitchen/items/:dishId`. Items use the existing protected commands
and stay at `kitchens/{kitchenId}/dishes/{dishId}`.

Add `workspaceMenus: true` when Items are enabled to build and review
[private drafts](src/runtime/kitchen/pages/menus.vue). The existing Menu
commands require a Place with a currency and retain the App membership,
Kitchen grant and subscription checks. Section placements reference existing
Kitchen Items. This installation registers draft creation, section creation
and Item placement.

Add `publicMenus: true` to publish a ready regular interactive Menu and serve
its [guest catalogue](src/runtime/menu/pages/browse.vue) at
`/kitchens/:slug/menus/:menuId`. The trusted publication command checks
Kitchen access and readiness. The guest route reads only published public
Menus and skips Service resolution. Services and Orders are unregistered.

## Ownership and execution

Kitchen owns its root and its domain access record bound to current App membership.
Place owns venue identity. AppUser owns App membership; it carries no Kitchen
index or primary selection. Team is a roster and does not grant access by inference.
Workspace selection is local App/family state.

[Kitchen access](src/runtime/kitchen/composables/useKitchenAccess.ts) waits for
Firebase Auth, the current AppUser membership and its Kitchen grants. It resolves
independently of `/api/app/status`.

Protected writes use named trusted server commands, including single-record
updates. Browser adapters capture the submitted values and original scope before
credentials; the server validates authority and invariants. Compound workflows
own their transaction boundaries and explicit non-atomic effects. Development
Rules policy is separate from these application commands.

UI and agent action entrances invoke the same named domain outcomes. Formal agent
metadata exists only where an actual agent consumer needs it. Services are named
server workflows; they do not require a separate universal folder or registry.
Existing Kitchen business service records are distinct from this architectural term.

Committed changes reach UI through live readers. Do not patch copied collections,
poll or refresh to simulate this. Public readers retain their own visibility rules.

## Verification

Inspect the owning reader/command, endpoint, actual consumers and nearest working
sibling. Run relevant source-owned tests under `src/test`, owning types and an
affected App prepare/build when discovery changes. Runtime TypeScript imports are
extensionless; Node-only tests may use an extension resolver. `pnpm --dir packages/extensions/fireux-kitchens test:spine`
runs the focused Entity/Workspace checks with Core's existing TypeScript resolver.
Finish with `git diff --check`. The old `scripts/` guards and `pnpm guard` are retired.

See `docs/concepts/workspace.md` for the current foundation boundary.
Capability internals are a separate stage, not certified by this landing map.

## Menu document review

The Kitchen keeps source uploads, the Menu review draft, and the confirmation
command. The [AI extension](../fireux-ai/README.md#document-processing)
processes selected sources. Keep failures per source visible. Interpreted
prices, language copies, and media candidates require the domain's review and
confirmation. Processing does not silently update a published Menu.

The canonical Menu owns Default content. Aligned extracted language copies
use Sproochli's host-local translation storage after confirmation. Optional
extras and required variants remain distinct. See the [Menu family](../../../docs/concepts/family-menu.md).

## Items collection

The [Items route](src/runtime/pages/workspace/kitchen/menu/items/index.vue)
renders a [simple list](src/runtime/kitchen/components/Workspace/Menu/Items/Index.vue).
Its [collection reader](src/runtime/kitchen/composables/workspace/menu/items/useKitchenWorkspaceItems.ts)
waits for the selected Kitchen to be ready.

Keep empty, failed, and pending reads distinct. Decide any further filtering,
card presentation, or related-record hydration from an actual Kitchen
workflow. A join needs its own authorized domain reader or projection.
A matching ID alone does not justify fetching another record.

## Item detail

The [detail route](src/runtime/pages/workspace/kitchen/menu/items/%5BdishId%5D.vue)
uses the current Kitchen grant to [read one Item](src/runtime/kitchen/composables/items/useKitchenItemRead.ts)
at `kitchens/{kitchenId}/dishes/{dishId}`. It shares that read with the
[Workspace detail](src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Index.vue),
which shows Item basics and editing alongside the
[Menu-owned guest presentation](src/runtime/menu/components/ItemDetail.vue).
That presentation uses an explicitly linked Menu or looks up a published
public placement in the selected Kitchen. Without a matching Menu it shows
the Item's basic presentation.

The same document supplies [Item identity](src/runtime/kitchen/records/menus/items/item.ts)
and [selling defaults](src/runtime/kitchen/records/menus/items/item-offer.ts)
as separate projections and provides the raw document for development diagnostics.
Menus, Prep and Team relationship panels are placeholders. Verify read reuse
and route scope with the [Item reader tests](src/test/item-reader-internals.test.mjs).
