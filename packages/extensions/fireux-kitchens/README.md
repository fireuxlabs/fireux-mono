# FireUX Kitchens

Updated: 2026-10-03
Role: package landing map, not canon

`fireux-kitchens` owns reusable Kitchen domain contracts, Workspace surfaces,
Tools and trusted server behaviour. Apps install and compose the package.
Read root `AGENTS.md`, `docs/ai/gpt-context.md` and the routed family/context maps
before changing it. Current source and source-owned tests establish behaviour.

## Entity spine

Kitchen implementation lives in `src/runtime/kitchen/` beneath technical roles:
`components`, `composables`, `models`, `server`, `utils`, and the consumed `demo`
and `tools` roles. Conventional Nuxt entrypoints remain at the runtime root.
There is no aggregate `useKitchen` CRUD facade or supported root Delete action.

- `composables/firestore/useKitchenRead.ts`: live root and same-ID Place read.
- `composables/firestore/useKitchenCreate.ts`: named directory/onboarding client entrances.
- `composables/firestore/useKitchenUpdate.ts`: typed update/publication adapter
  to `/api/workspace/kitchen/update`, with captured input and account/App scope.
- `composables/workspace/useKitchenWorkspace.ts`: selection, access-bounded
  current root, allowance and consumed bound updater. It owns no alternate CRUD lane.
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
extensionless; Node-only tests may use an extension resolver. Finish with
`git diff --check`. The old `scripts/` guards and `pnpm guard` are retired.

See `docs/concepts/family-workspace-entity.md` and
`docs/reviews/entity-spine-audit-2026-10-01.md` for the audited foundation boundary.
Capability internals are a separate stage, not certified by this landing map.
