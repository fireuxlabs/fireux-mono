# Workspace

Updated: 2026-10-21
Ref: d05ded3fd
Role: map, not canon

## Purpose and authority

Map shared Workspace mechanics, domain-owned capabilities and their current
adoption. Inherit `../../AGENTS.md` and `../ai/gpt-context.md`. Current source
and executable checks establish behaviour; this map routes into that evidence.
The detailed family inventory and deltas belong in
[family-workspace-entity.md](family-workspace-entity.md).

The product hierarchy is Workspace → Capability → Tool → authorized command.
Workspace is a working surface over an Entity, not another Entity, storage owner
or compulsory controller layer. A navigation group adds an overview entrance,
not another data or authority layer.

Related maps: [repository](fireux-mono.md), [components](components.md),
[runtime placement](runtime-filesystem.md), [pages](pages.md),
[capability grammar](family-workspace-capability-tool.md), and
[tenant/global composition](family-tenant-global.md).

## Ownership

```text
App → Ecosystem → Extension → Core

Core                    Shared Workspace mechanics and proved controls
Domain Entity runtime   Identity, capabilities, authority, records and commands
Ecosystem / App         Product composition, enabled surfaces and App policy
```

- Core owns selection mechanics, entry resolution, navigation framing,
  `WorkspaceGroupPage`, and shared Identity and Team interaction primitives.
- Domains supply accessible Entity collections, canonical readers, fields,
  roles, invitations, capability rules and trusted commands. Sharing a control
  does not transfer its authority to Core.
- Apps own deployment, branding, configured navigation and route adapters.
  Ecosystems own genuine cross-extension composition. Neither copies a lower
  owner's implementation.
- An independently owned child Entity retains its models and commands even when
  another Entity's Workspace manages it. UI grouping does not decide storage.

Current Core entrypoints under `packages/core/fireux-core/src/runtime/`:

- `composables/fireux/workspace/useWorkspace.ts`: active Entity selection.
- `composables/fireux/workspace/useWorkspaceEntryCta.ts`: App-aware entry links.
- `components/Workspace/EntitySwitcher.vue`: selected-Entity switching control.
- `components/Workspace/GroupPage.vue`: group framing and breadcrumbs.
- `composables/fireux/useIdentity.ts` and `useTeam.ts`: shared interaction state.
- `components/Workspace/Team/`: Editor, People, Assignment and Roles controls.

## Home, Overview, groups and children

These are separate responsibilities:

| Surface | Job |
| --- | --- |
| Home | Resolve the selected Entity, offer switching or permitted creation, and provide the product's working entrance. |
| Overview | Summarise the selected Entity across its implemented capabilities. |
| Group index | Introduce a related set of child capabilities, with one useful surface per child. |
| Capability page | Do the named domain work with its own controls and authority. |
| Record page | Inspect or edit a record when the journey needs a separate destination. |

Kitchen's inspected navigation places shared Identity & brand and Team before
Misebox domain groups, with Settings after domain work. Home is reached through
the persistent selected-Kitchen control rather than another normal sidebar row.
Other families retain their own declared navigation; this is not a claim that
all have adopted Kitchen's grouping or need the same number of groups.

`WorkspaceGroupPage` owns the common panel, navbar, width and breadcrumbs. Its
slot can compose group AI followed by one domain-owned surface per child; its
default content can link declared children. Child surfaces behave consistently
without sharing identical markup, fields or controllers.

Kitchen's `FoodAndDrink/Index.vue` demonstrates the composed form: group AI,
Items, Menus, Promotions and Services overview components. Children own local
imports and state; one page-provided overview supports genuinely shared AI and
page JSON. Status and missing-data flags come from records and policy, not AI.
Do not mount editing controllers merely to calculate overview counts.

## Component organisation

Entity implementation lives under `src/runtime/<entity>/<technical-role>`.
Within components, meaningful domain capabilities own their presentation;
`Workspace` naming is reserved for actual selection, Home, navigation, overview
and cross-page Workspace mechanics.

Kitchen's inspected arrangement is:

```text
kitchen/components/
  Identity/
  Team/
  FoodAndDrink/
    Index.vue
    Items/
    Menus/
    Promotions/
    Services/
  PrepAndProduction/
    Index.vue
    Recipes/
    Ingredients/
    Stations/
    PrepItems/
  Finance/
  Orders/
  ...other named domain capabilities
  Workspace/
    Index.vue
    Home/
    Navigation/
    Selector/
    Overview/
    ...named cross-page Workspace helpers
```

Domain capabilities are not universal Workspace machinery. Kitchen Services,
for example, owns menu selection and serving policy; other industries do not
inherit that meaning merely because they also use the word service.

Property Team now lives in `property/components/Team/Index.vue` and is consumed
as `PropertyTeam`; its roles and commands remain Property-owned. Other Property
capabilities, Portfolio, Project, Supplier and Blank still retain capability
components under their `components/Workspace` directories. This is bounded
placement migration, not completed repository alignment. Inspect registration,
real consumers, relative imports and checks before each move. Preserve domain
differences; remove retired paths rather than adding forwarding aliases.
Do not create empty folders or sidebar-shaped containers for symmetry.

## Selection and entrances

One active Entity ID is shared selection state. Its accessible collection and
permissions remain domain-owned. A saved ID grants no read or write authority.

- Restore a valid last selection; wait for access to settle before fallback.
- Loading and errors must not appear as an empty accessible collection.
- A settled non-empty collection retains a valid selection; confirmed empty
  access permits no selection.
- Core persists the last selection in an App/family cookie for one year on the
  current host and synchronises cookie changes between tabs. There is no separate
  Primary Kitchen preference.
- Record-specific navigation must be considered when changing the active Entity;
  shared selection alone does not prove every domain's return journey.

Home is available as a surface even before a domain record exists. Creation and
attachment use existing domain commands, access checks and capacity policy;
there is no universal `crud.create` shape required of every controller.

Misebox serves public discovery at its public host's `/` and Kitchen Home at the
Workspace host's `/`, without a `/workspace/kitchen` Home alias. BuenoHost and
Granite retain `/workspace/property` and `/workspace/portfolio`. FireUX presents
its industry SaaS offering and framework resources at `/` and keeps Project Workspace at
`/workspace/project`. Only its Workspace host redirects root to Project Home.
Tenant Apps retain their customer root and an
App-resolved Workspace entrance. Use `useWorkspaceEntryCta`, not a hard-coded
family path, for shared entry actions.

## Composition and authority

Routes remain thin adapters. Ordinary leaf pages own their explicit page shell;
group indexes may delegate that framing to `WorkspaceGroupPage`. Preserve the
real flex root and existing Workspace transition policy. Inspect the registered
route and generated App output rather than inferring behaviour from a filename.

A capability mounts its stateful graph once. Focused descendants consume that
context when shared, while owning their local editing responsibilities. Do not
add duplicate readers, pass-through controllers or universal form schemas.
Small creation/editing actions may stay inline or in dialogs; separate routes
are justified by the actual workflow, not a compulsory create/edit page list.

Route metadata owns route access and selection requirements. Domain commands
retain server-side scope and permission checks; navigation visibility, saved
selection and UI `canWrite` are not authority. Contextual AI may explain state
or prepare supported actions, but does not become another writer or permission
system. Notifications remain User-owned shared presentation.

## Adoption and future industries

| Family | Current boundary |
| --- | --- |
| Kitchen | Shared foundation plus capability-first component arrangement and composed group indexes. |
| Property / Portfolio | Shared foundation with domain-owned accommodation/property capabilities; capability placement still uses Workspace folders. |
| Project | Shared foundation with FireUX control-plane capabilities; capability placement still uses Workspace folders. |
| Supplier | Shared foundation with Supplier-owned catalogue work; capability placement still uses Workspace folders. |
| Blank | App-local development harness, not a complete industry product. |
| Marketplace Store | Workspace root ownership declared; working Workspace surface remains future work. |

Use [the family map](family-workspace-entity.md) for exact accepted differences,
authority boundaries and proving checks. A shared foundation does not establish
that every capability, route or browser journey is complete.

Future industry work starts with operator needs and named domain owners. Reuse
proved Core mechanics and lower capabilities, then add only the domain behaviour
needed. Do not clone Kitchen's capability list, require six universal pages,
or invent an industry package before real siblings prove common behaviour.

[Ignite's context](../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md)
owns the build/reconciliation method and its evidence contracts. It does not
currently generate or automatically enforce this folder organisation. Misebox
is a reference implementation; independent assembly and acceptance remain
separate evidence.

## Refresh and verification

When owners, registration, entrances or shared contracts change, refresh this
map in the same change. Keep detailed family deltas in the family map and
repo-wide rules in global context; do not accumulate task history here.

For a bounded alignment, trace route → composition → controls → state owner →
commands, including Nuxt component names and indirect consumers. Run the owning
source tests and relevant package/App checks. A file move or green typecheck
alone does not establish composition or a verified user journey. For map-only
changes, verify source pointers and claims and run `git diff --check`.
