# Console entity family

Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose

Map the shared Console Entity spine, the reasons domains differ, and the work
still needed to remove unexplained drift.

## Links

- Parent: `console.md`
- Child: `family-tenant-global.md`
- Horizontal: `entities.md`, `pages.md`, `components.md`, `composables.md`,
  `firestore-entity.md`
- Executable reference: `scripts/guards/console-indexes.mjs`
- Authority reference: `scripts/guards/root-app-support-authority.mjs`

## Members and current surface

| Member    | Current core sheets                                 | Status and reason                                                                                                                                   |
| --------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blank     | Index, Overview, Create                             | `accepted`: app-local minimal harness; it proves the shared target lifecycle without invented domain Identity, Team, or Operations                  |
| Kitchen   | Index, Overview, Identity, Team, Create, Operations | `accepted`: Place-backed identity, dual Live/Demo targets, real Kitchen people records, and a large operational domain                              |
| Supplier  | Index, Overview, Identity, Team, Create, Operations | `accepted`: root + App support target with access-only Team today and Supplier-owned catalogue/item/ingredient operations                           |
| Portfolio | Index, Overview, Identity, Team, Create, Operations | `accepted`: root + App support target with access-only Team and a private-heavy document/property domain                                            |
| Property  | Index, Overview, Team                               | `to-confirm`: Property is a confirmed Console Entity, but standalone Identity/Create lifecycle versus Portfolio-owned lifecycle is not yet explicit |
| Project   | Index, Overview, Identity, Operations               | `accepted`: private, root-only, read-only FireUX control-plane entity; it has no App support record, Team, or production Create flow                |

The table records current source, not a promise that every listed sheet is
finished.

## Shared spine

Every Console Entity must share these rules:

- The family core owns target candidate resolution, the authoritative target
  collection outcome, and selection validity.
- Index and Overview adapters consume that core state. They do not create a
  second membership resolver or target outcome.
- Target outcomes are explicit: `idle`, `pending`, `error`, `empty`, or
  `ready`. Read failure never becomes an empty authority list.
- The guarded Index order is Selected → Targets → Debug.
- `ConsoleXIndex` delegates through `useXConsoleIndex` to shared
  `useConsoleIndex`.
- Selected presentation uses `ConsoleSelectedTarget`; target state uses
  `ConsoleTargetCollection`.
- Persisted selection is invalidated only after a successful target read proves
  it invalid. Pending or failed reads do not clear it.
- Tenant and global Apps query bounded entity App-support authority. Neither
  mode authorizes a full-root client scan followed by local filtering.
- `operator_ids` grants mutation authority. `team_ids` grants target/read
  membership only. Current App admins are the explicit override.
- Visible `canWrite` state never replaces server or Rules enforcement.
- Canonical root creation is independently valid and may remain `root_only`.
  Explicit App attachment uses a fixed-runtime authenticated family endpoint
  and one trusted transaction for root scope, same-id App support, and the
  caller's operator/team authority. A convenience funnel may sequence root
  creation then attachment, but support never substitutes for the root.
- Index, Overview, Identity, Team, and Operations remain separate concerns.
  A family adds only sheets backed by a real lifecycle.

## Accepted deltas

| Delta                                                    | State      | Why it exists                                                                                                                         | Evidence or owner                                                                         |
| -------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Kitchen renders Live and Demo target sources             | `accepted` | Demo is an optional, lazy, read-only Kitchen product surface; the sources still feed the same target presenter and selection contract | Kitchen core plus `scripts/guards/console-indexes.mjs` and `scripts/guards/demo-data.mjs` |
| Kitchen Team adds members and join requests below Access | `accepted` | Kitchen has operational people records in addition to target-level authority; those records do not grant authority by themselves      | `useKitchenConsoleTeam` and `Console/Kitchen/Team`                                        |
| Supplier, Portfolio, and Property Team are Access-only   | `accepted` | Their current Team pages expose shared `team_ids`/`operator_ids` truth without inventing domain people collections or edit controls   | family `useXConsoleTeam` adapters and `ConsoleTeamPanel`                                  |
| Blank omits Identity, Team, and Operations               | `accepted` | Blank is a structural harness, not a product domain                                                                                   | `projects/fireux/fireux-blank`                                                            |
| Project has no App support, Team, or Create              | `accepted` | Project authority is the private FireUX control plane and is currently read-only                                                      | Project entity declaration and internal control-plane APIs                                |
| Operation folders differ by domain                       | `accepted` | Operations represent selected-target work, so Kitchen, Supplier, Portfolio, and Project own different children                        | each owning package under `Console/X/Operations` and `console/x/operations`               |

Accepted deltas change domain content or authority. They do not change the
Index outcome contract.

## Migration and drift register

| Difference                                                                                 | State        | Required direction                                                                                                                     |
| ------------------------------------------------------------------------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Supplier and Portfolio public-read contracts remain `to-confirm`                           | `to-confirm` | Decide the bounded public projection before claiming public detail/index parity                                                        |
| Property lacks an explicit standalone Identity/Create decision                             | `to-confirm` | Decide whether Property owns those sheets or deliberately enters through Portfolio; document and guard the result                      |
| Team access presentation does not yet hydrate polished people consistently outside Kitchen | `drift`      | Keep raw authority ids factual for now; add one shared bounded people projection only when the privacy and source contract is agreed   |
| Console operation child matrix is not complete                                             | `drift`      | Inventory visible routes against owning operation components/composables and remove parked or fake operations                          |
| Kitchen authored route slug differs from stable root identity                              | `accepted`   | Resolve the slug through the bounded Kitchen route resolver while Console and operation relationships retain the stable root ID        |

## Component and composable naming

Shared names:

- `ConsoleXIndex`
- `ConsoleXIndexSelected`
- `ConsoleXIndexTargets`
- `ConsoleXOverview`
- `useXConsole`
- `useXConsoleIndex`
- `useXConsoleOverview`

Conditional names:

- `ConsoleXIdentity` and `useXConsoleIdentity` when identity editing/reading is
  a real Console sheet.
- `ConsoleXTeam` and `useXConsoleTeam` when target Access or domain people are
  exposed.
- `ConsoleXOperationsY` and `useXConsoleY` for selected-target domain work.

Kitchen may use nested Identity sections because the sheet has Place,
publication, theme, hours, delivery, and payment concerns. That is an accepted
composition delta, not permission to fork the Console Index spine.

## Alignment roadmap

### Now

- Preserve the guard-backed six-family Index parity.
- Keep one family-owned target outcome and one outcome-bound selection.
- Label Team as target Access first; keep Kitchen people records explicitly
  separate from authority.

### Next

- Keep Kitchen root + required Place + access-only AppKitchen composition
  guarded across Live, Demo, and Test sources.
- Keep Kitchen live Create on its guarded trusted onboarding endpoint and keep
  AppKitchen access support payload-free.
- Resolve Property's standalone Identity/Create lifecycle.
- Reconcile Supplier and Portfolio root validation before confirming public
  projections.
- Audit operation routes against operation ownership and remove unexplained
  children.

### Later

- Add shared people hydration only after a bounded privacy-aware contract is
  proven by more than one family.
- Promote Overview, Identity, or Team details into guards only after their
  lifecycle shapes are as stable as the current Index contract.
