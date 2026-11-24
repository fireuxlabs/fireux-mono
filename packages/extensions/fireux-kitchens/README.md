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

The Kitchen application model exposes owned data directly. A capability's
canonical type lives in its owner's `models/`. Use `records/` for
record-specific implementation when it has a distinct responsibility. Keep
readers and actions in `composables/`, trusted commands and persistence in
`server/`, presentation in `components/`, and pure helpers in `utils/`.
The Misebox sidebar supplies the inventory for the flat model's optional
slots. Readers supply each capability's data when implemented. View slots may
be derived, and a slot does not define a Firestore field or collection.

- The [Kitchen application model](src/runtime/kitchen/models/kitchen.model.ts)
  requires `id`, `name` and `items`. The [root reader](src/runtime/kitchen/utils/read-kitchen-document.ts)
  gets the ID from the document path. A name-only Kitchen stores `name`.
- [Item model](src/runtime/kitchen/models/item.model.ts) retains its own
  identity and is loaded from `kitchens/{kitchenId}/items/{itemId}`.
  The Kitchen never stores its Item array in the document.

## Identity & brand

The [trusted update](src/runtime/kitchen/server/identity/update.ts) checks the App
membership and Kitchen grant in the write transaction. It checks flat and
legacy slugs in the shared Kitchen URL namespace. Renaming leaves the slug
intact. A Place link refers to an existing Place and does not update it.

Context remains internal. The flat public summary requires an explicit active
status, public visibility and a slug. Existing directory and detail reads
enforce visibility. The flat summary is available for the later Public Kitchen
implementation.

### Reset boundaries

The reset covers Kitchen creation, identification and Items CRUD. La Tap Bern's
Items have been copied into `items`. The existing `dishes` data is retained.
Other Kitchens need their own migration decision.
The root reader projects only the required fields. Place-backed identity
workflows, Menus and
publication, Services, Orders, and Tables still depend
on parts of the former model or path and require separate alignment. The
restricted Firestore Rules changes are local source for emulator verification.

## Ownership and execution

Kitchen owns its root and its domain access record bound to current App membership.
Place owns venue identity. AppUser owns App membership; it carries no Kitchen
index or primary selection. Team is a roster and does not grant access by inference.

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

## Workspace Kitchen and Items

The [Kitchen collection](src/runtime/kitchen/composables/useKitchenCollection.ts)
lists only granted Kitchen roots. Older documents can use their stored
`identity.name` or a same-ID Place name as a display fallback. A missing or
failed Place read leaves the Kitchen accessible under its document ID.

Item writes retain the protected create, update and delete commands. Delete checks stored references.

The [Item model](src/runtime/kitchen/models/item.model.ts) owns identity, food or
drink kind, and selling terms on the same document. A name-only Item is valid.
Priced terms use an explicit `currency_code`. A fixed-price Item stores `price`.
A full-price group stores prices on its options, and the starting price is
derived from them. Extras add to the base or selected price. The Item reader
keeps identity usable if older selling data cannot be parsed. Menu placements
continue to reference the Item through the existing contract.
