# Console entity family

Updated: 2026-08-19
Ref: e23268507
Role: map, not canon

## Purpose

Map the shared Console Entity spine, the reasons domains differ, and the work
still needed to remove unexplained drift.

## Links

- Parent: `console.md`
- Child: `family-tenant-global.md`
- Horizontal: `entities.md`, `pages.md`, `components.md`, `composables.md`,
  `firestore-entity.md`, `runtime-filesystem.md`
- Executable reference: `scripts/guards/console-indexes.mjs`
- Server-shape reference: `scripts/guards/console-entity-server.mjs`
- Authority reference: `scripts/guards/root-app-support-authority.mjs`

## Members and current surface

The exact peer and Operation lists live once in the source-backed capability
map in `console.md`. The family deltas are:

| Member    | Status and reason                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blank     | `accepted`: app-local minimal harness; it proves the complete baked-in Console baseline with factual read-only Team authority and no Operations           |
| Kitchen   | `accepted`: Place-backed identity, dual Live/Demo targets, real Kitchen people records, and a large operational domain                                    |
| Supplier  | `accepted`: root + App support target with authority-backed Team today and Supplier-owned Catalogue, Ingredient, and Item operations                      |
| Portfolio | `accepted`: root + App support target with authority-backed Team and a private-heavy Property, document, task, compliance, and Finance domain             |
| Property  | `accepted`: root + App support target with Identity and Team plus Reservation and Calendar operations                                                     |
| Project   | `accepted`: private, root-only FireUX control-plane entity; Team uses Project authority without inventing an App-support record or production Create flow |

## Shared spine

Every Console Entity must share these rules:

- Entity server capabilities under the entity-scoped destination follow the
  Console's vertical product slices: `core/`,
  `index/`, `overview/`, `identity/`, `team/`, `operations/`, and `ai/`.
  A slice exists only when it owns real server behaviour; empty placeholder
  files and folders are not required.
- `core/` owns entity-wide authority and target resolution. `index/` owns the
  collection and Create/onboarding doorway. `overview/` owns only genuine
  overview-specific reads. `identity/` owns identity projection and mutation.
  `team/` remains a first-class Console capability. `operations/` owns all
  operations performed by or for that entity; for example,
  `kitchen/operations/` owns all Kitchen operations. `ai/` owns the entity's
  AI capability without becoming a generic Console navigation peer.
- Technical phases such as `access`, `lifecycle`, `mutation`, `projection`,
  and `presentation` are not entity root slices. Their behaviour stays inside
  the Console capability that owns it. HTTP adapters remain under
  `runtime/server/api` and call these entity-owned capabilities.
- Core owns only server primitives proven across entity families. Shared App
  runtime policy, membership validation, bounded support-authority parsing,
  and capacity enforcement live in
  `packages/core/fireux-core/src/runtime/server/utils/console-entity/onboarding-authority.ts`.
  Entity-specific management validation, projections, messages, and
  transactions remain in the owning entity slice.

- Console is the shared selected-workspace surface, not the entity owner.
  Shared Console components and composables remain in the root technical
  spine. Entity-specific Console components and composables move to
  `runtime/<entity>/components/Console` and
  `runtime/<entity>/composables/console`; entity models and server commands do
  not move under Console merely because it consumes them.

- The family core owns target candidate resolution, the authoritative target
  collection outcome, and selection validity.
- Every family enters through `/api/console/{family}/targets`. Core owns one
  authenticated App + family + User request lifecycle; each family retains
  its own authority query and domain projection.
- Every `useXConsole` entrypoint returns one request-scoped family runtime.
  Selector and selected-target pages consume it rather than reconstructing
  targets, selection, or entity state.
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
- Root + App-support onboarding uses a fixed-runtime authenticated family
  endpoint and one trusted transaction for root, same-id App support, and the
  caller's operator/team authority.
- Console-capable roots share one management ladder: `root`, `console`, or
  `app`. `console` resolves by convention to the ecosystem App
  (`<ecosystem>-app`); no configurable Console App id is stored. `app` alone
  stores `app_id`. Domain packages own their transactions, so Core does not
  enumerate present or future Console families.
- Index owns target selection and its Create doorway. Overview, Identity,
  Team, and Operations remain separate selected-workspace concerns; Create is
  never a selected-workspace menu peer.
  A family adds only sheets backed by a real lifecycle.

## Accepted deltas

| Delta                                                               | State      | Why it exists                                                                                                                         | Evidence or owner                                                                                                      |
| ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Kitchen renders Live and Demo target sources                        | `accepted` | Demo is an optional, lazy, read-only Kitchen product surface; the sources still feed the same target presenter and selection contract | Kitchen core plus `scripts/guards/console-indexes.mjs` and `scripts/guards/demo-data.mjs`                              |
| Kitchen Team adds members and join requests beyond target authority | `accepted` | Kitchen has operational people records in addition to target-level authority; those records do not grant authority by themselves      | `useKitchenConsoleTeam` and `Console/Kitchen/Team`                                                                     |
| Supplier, Portfolio, and Property Team are authority-backed only    | `accepted` | Their current Team pages expose shared `team_ids`/`operator_ids` truth without inventing domain people collections or edit controls   | family `useXConsoleTeam` adapters and `ConsoleTeamPanel`                                                               |
| Blank has no child Operations                                       | `accepted` | Blank is a structural harness; its baked-in Team sheet projects existing access authority without inventing membership tools          | `projects/fireux/fireux-blank`                                                                                         |
| Project has no App support or Create                                | `accepted` | Project Team and Operations use private FireUX control-plane authority rather than an App-support onboarding lifecycle                | Project entity declaration and internal control-plane APIs                                                             |
| Operation folders differ by domain                                  | `accepted` | Operations represent selected-target work, so Kitchen, Supplier, Portfolio, and Project own different children                        | current source uses each owner's `components/Console/Operations` and `composables/console/operations` capability paths |

Accepted deltas change domain content or authority. They do not change the
Index outcome contract.

## Migration and drift register

| Difference                                                                          | State        | Required direction                                                                                                                   |
| ----------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Supplier readers return canonical Supplier and related Place Entities               | `accepted`   | Preserve both canonical records; Console consumers must not manufacture replacement Entity DTOs                                     |
| Team presentation does not yet resolve polished people consistently outside Kitchen | `drift`      | Keep raw authority ids factual for now; add one shared bounded people projection only when the privacy and source contract is agreed |
| Kitchen authored route slug differs from stable root identity                       | `accepted`   | Resolve the slug through the bounded Kitchen route resolver while Console and operation relationships retain the stable root ID      |
| Console Entity implementation uses `runtime/<entity>/<technical role>`              | `accepted`   | Preserve Nuxt pages/API entrypoints and established component/composable names through explicit scoped registration                  |

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
- `ConsoleXTeam` and `useXConsoleTeam` when target authority or domain people are
  exposed.
- `ConsoleXOperationsY` and `useXConsoleY` for selected-target domain work.

Kitchen may use nested Identity sections because the sheet has Place,
publication, theme, hours, delivery, and payment concerns. That is an accepted
composition delta, not permission to fork the Console Index spine.

## Alignment roadmap

### Now

- Preserve the guard-backed six-family Index parity.
- Keep one family-owned target outcome and one outcome-bound selection.
- Keep Team as a Console peer and keep Kitchen people records explicitly
  separate from target and mutation authority.

### Next

- Keep Kitchen root + required Place + access-only AppKitchen composition
  guarded across Live, Demo, and Test sources.
- Keep Kitchen live Create on its guarded trusted onboarding endpoint and keep
  AppKitchen access support payload-free.
- Preserve canonical Supplier and related Place records in Console readers;
  Portfolio remains its canonical readable root with scoped and private work
  owned separately.
- Keep every Entity operation catalogue limited to the Operations listed in
  `console.md`; baked-in capabilities never enter operation-only consumers.

### Later

- Add a shared people projection only after a bounded privacy-aware contract is
  proven by more than one family.
- Promote Overview, Identity, or Team details into guards only after their
  lifecycle shapes are as stable as the current Index contract.
