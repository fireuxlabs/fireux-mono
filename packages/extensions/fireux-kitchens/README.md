# FireUX Kitchens

Updated: 2026-11-07
Role: package landing map, not canon

`fireux-kitchens` owns reusable Kitchen domain contracts, Workspace surfaces,
Tools and trusted server behaviour. Apps install and compose the package.
Read root `AGENTS.md`, `docs/ai/gpt-context.md` and the routed family/context maps
before changing it. Current source and source-owned tests establish behaviour.

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
- `utils/read-kitchen-document.ts`: strict stored-root validation, independently
  of stamp-free public summaries and Place-derived presentation.
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

## Ownership and execution

Kitchen owns its root and its domain access record bound to current App membership.
Place owns venue identity. AppUser owns App membership; it carries no Kitchen
index or primary selection. Team is a roster and does not grant access by inference.
Workspace selection is local App/family state.

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

See `docs/concepts/family-workspace-entity.md` for the current foundation boundary.
Capability internals are a separate stage, not certified by this landing map.
