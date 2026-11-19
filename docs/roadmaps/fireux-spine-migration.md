# FireUX spine migration plan

Date: 2026-11-18
Source baseline: `c2748cea8`
Role: bounded migration plan and portable handoff; target design, not a claim of completed migration

## Read this first

FireUX should be easy to navigate by ownership. A package runtime contains the
native Nuxt spine plus explicit FireUX Entity roots. Each Entity contains only
the technical roles it needs. Entities do not recursively contain other Entity
spines. An Entity may own ordinary records without promoting those records into
independent Entities.

Component and composable names should tell the same ownership story as their
paths: Entity, then audience where relevant, then capability, then child.

Execute this migration through complete, explicitly selected owner-and-consumer
slices. The plan does not authorize a blanket rewrite, stored-data migration or
deployment. Current source establishes existing behavior; the decisions below
establish the intended target.
The committed baseline contains the accepted native Workspace layout migration
and the Kitchen state-owner checkpoint saved in `08e5825ee`. The later
[discussion handoff](../handoffs/2026-11-17-fireux-predictable-spine-rules.md)
sharpens the first step to audit Menu and Prep & Production together as
document-oriented groups; Orders retains its operational application pattern.
Read that handoff alongside this plan. Always inspect the live checkout and
existing owners before editing; do not assume the historical checkpoint means
there is no new concurrent work.

## The agreed structure

The non-recursive boundary is:

1. **FireUX spine:** native Nuxt technical roles plus sibling Entity roots, and
   the existing shared Workspace owner where justified.
2. **Entity spine:** only its required Nuxt-style technical roles plus optional
   owned `records/`; it contains no further Entity spines.
3. **Placement decision:** a genuine Entity gets a sibling root on the owning
   package's FireUX spine. Parent-owned support truth remains a Record, whose
   behavior uses its owner's existing technical roles. Records do not get spines.
4. **Native discovery:** pages, layouts, middleware, plugins and HTTP API
   entrypoints remain on the outer Nuxt spine. An Entity is not a nested Nuxt App.

Classify by ownership and lifecycle first; do not promote or demote a concept
merely to obtain a tidy tree. Workspace retains its existing shared ownership;
its precise architectural terminology remains an open decision.

```text
packages/<lane>/<owning-package>/src/runtime/
├── pages/                     # Native Nuxt entrypoints
├── layouts/
├── middleware/
├── plugins/
├── server/
│   └── api/                   # HTTP adapters delegate to domain owners
├── components/                # Proved shared presentation
├── composables/               # Proved shared mechanics
├── workspace/                 # Genuine shared Workspace owner, where needed
│
├── kitchen/                   # Entity
│   ├── models/
│   │   └── model.ts           # Kitchen itself
│   ├── records/
│   │   └── item.ts            # Kitchen-owned record definition
│   ├── components/
│   │   └── Workspace/
│   │       └── Menu/
│   │           ├── Index.vue
│   │           ├── Overview.vue
│   │           ├── Create.vue
│   │           ├── Ai.vue
│   │           ├── Items/
│   │           ├── Promotions/
│   │           └── Services/
│   ├── composables/
│   │   ├── items/             # Record readers and workflows
│   │   └── workspace/
│   │       └── menu/          # Workspace-specific coordination
│   ├── server/
│   │   └── items/             # Protected domain commands
│   └── utils/
│
├── menu/                      # Entity, even when Kitchen-scoped
├── recipe/                    # Entity; must support use outside Kitchen
└── ingredient/                # Entity
```

This is an ownership example, not a mandatory scaffold. Keep native entrypoints
on the Nuxt spine. Entity-local `server/` contains domain behavior, rather than
another automatically discovered HTTP application. An Entity only gets the
directories and capabilities that have real responsibilities and consumers.
Technical support roles such as assets and content must retain an honest owner;
do not promote them to shared roots merely to make a diagram symmetrical.

Sibling Entity roots belong in their owning package. Do not create one central
monorepo directory containing all Entities, or split every Entity into a package.
Source placement does not determine database placement or authorization.

## Entity, record and shape

An **Entity** is a first-class domain concept whose identity and lifecycle matter.
It gets a root on the owning package's FireUX spine. It need not expose its own
Workspace. A scoped Entity may retain a relationship to a parent without its
source being physically nested under that parent's source.

An **owned Record** supplies truth belonging to one Entity. Its definition lives
under that Entity's optional `records/` directory. Its components, readers,
workflows and commands use that Entity's existing technical roles. Records do
not receive complete miniature spines beneath `records/`.

An **embedded shape** stays beside the model or record it describes. It does not
need a root, a reader, a controller or a generic types directory of its own.

The agreed decisions and remaining classification work are:

| Concept     | Target                                   | Migration consequence                                                                                                                                                                 |
| ----------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kitchen     | Entity with a Workspace                  | Retain the Kitchen spine and its authority.                                                                                                                                           |
| Menu        | Entity with Kitchen-scoped records today | Keep its existing `runtime/menu/` ownership; Kitchen's Workspace Menu capability composes it.                                                                                         |
| Recipe      | User-owned Entity outside Kitchen        | Give Recipe its own spine; Kitchen references explicitly approved versions and retains approved internal use. Implement ownership and associations before changing current authority. |
| Item        | Kitchen-owned Record                     | Do not create a top-level `runtime/item/` Entity. Move its definition and behavior into Kitchen's record and technical roles.                                                         |
| Preparation | Kitchen-owned Record                     | Move its definition into `kitchen/records/prep/preparations/preparation.ts` and behavior into Kitchen technical roles; retain existing scope and Recipe relationships.                                  |
| Ingredient  | Existing shared culinary Entity          | Retain its named owner and canonical identity.                                                                                                                                        |

A portable Recipe describes its output with an embedded shape. A Kitchen
Preparation identifies that Kitchen's reusable output; Kitchen owns its chosen
Recipe association and local decisions. These are separate responsibilities,
without a shared Preparation Entity. Current Recipe `output_preparation_id` and
Preparation input references are Kitchen-bound and remain unchanged during the
Preparation source migration.

Current source uses Item and Preparation, while parts of the Entity map still
say Dish and KitchenPrepItem. Reconcile vocabulary against current models and
Daniel's product decisions. Do not rename persisted collections as a side effect.

## Components and composables follow one hierarchy

Operator component names use **Entity, Workspace, capability, child**. Shared
Core `Workspace*` components retain their shared owner. Public component naming
remains `Public<Entity>*` for now; no Public rename was agreed for symmetry.

Composable public names use `use` followed by the same path hierarchy:

| Path relative to runtime                                  | Public name                            |
| --------------------------------------------------------- | -------------------------------------- |
| `kitchen/components/Workspace/Menu/Index.vue`             | `KitchenWorkspaceMenu`                 |
| `kitchen/components/Workspace/Menu/Services/Overview.vue` | `KitchenWorkspaceMenuServicesOverview` |
| `kitchen/composables/workspace/menu/index.ts`             | `useKitchenWorkspaceMenu()`            |
| `kitchen/composables/workspace/menu/services.ts`          | `useKitchenWorkspaceMenuServices()`    |
| `recipe/composables/read.ts`                              | `useRecipeRead()`                      |

The latest agreed order supersedes the earlier proposed spellings
`useKitchenMenuWorkspace()` and `useKitchenMenuServicesWorkspace()`. The Menu
and Prep group entrypoints now use the path-led order; remaining lower capability
APIs are separate bounded migration inputs, not additional accepted naming variants. The collection value can still be named `menus`;
singular Menu identifies the `/menu` capability.

Nuxt derives component names from registered paths and prefixes. Composable
auto-imports use exported names; nested scan configuration alone does not add
path namespaces. Keep explicit named exports matching the intended path name,
so direct imports and native auto-imports agree. Use existing Nuxt registration
mechanics, with narrowly configured nested discovery where required. Check
generated declarations for collisions and accidental internal exports.

A focused check may validate the public path/export agreement. It must account
for private helpers and genuine lower reader or command APIs. Do not add a
custom runtime resolver, generated alias layer, forwarding barrels, or export
every internal helper just because its file is discoverable.

Official references: [Nuxt components](https://nuxt.com/docs/4.x/directory-structure/app/components),
[Nuxt composables](https://nuxt.com/docs/4.x/directory-structure/app/composables),
and [Nuxt Kit auto-imports](https://nuxt.com/docs/4.x/api/kit/autoimports).

## Parent and child ownership

The Menu parent mounts one shared Workspace owner. Its public parent-facing
return contains only `description`. Its children own meaningful projections or
interactions, consuming that same acquisition graph through strict internal
lookup. A missing parent never silently creates another owner.

The six Menu responsibilities are Overview, Create, Ai, Items, Promotions and
Services. Their public composables follow the new order, for example
`useKitchenWorkspaceMenuOverview()` and `useKitchenWorkspaceMenuServices()`.
Services owns service-specific derivations rather than leaving them in an
oversized group overview. Preserve one combined page publisher, scope changes,
disposal, command authority and the exact shared collection.

Do not expose delivery mechanics through public State or Context suffixes, or
create synthetic `*-group` ownership folders. Pure presentation children use
props and events. Six children are a Kitchen Menu product decision, not a
mandatory six-part scaffold for every capability.

The existing upload, URL and blank creation workflow remains one reusable flow
for modal and standalone preparation. The modal owns its frame and open state;
do not duplicate creation behavior or collapse distinct responsibilities merely
to obtain a short component name. Record editors retain their separate owners.

## Migration order

### 1. Reconcile the contract before moving source

Read [AGENTS.md](../../AGENTS.md), [global context](../ai/gpt-context.md), and
the applicable scoped contexts. Inventory the current source and concurrent
work. Reconcile the maintained documentation graph for the rules being replaced,
including [Entities](../concepts/entities.md),
[runtime placement](../concepts/runtime-filesystem.md),
[components](../concepts/components.md), [composables](../concepts/composables.md),
[Workspace family](../concepts/family-workspace-entity.md),
[Workspace](../concepts/workspace.md), [Menu](../concepts/family-menu.md), and
the [Misebox context](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md).

In particular, replace the older suffix-style composable target, reconcile
Item's former Entity classification, document optional owned `records/`, and
record Recipe's intended independence without claiming it is implemented.
Keep current-source links truthful until their complete cutover. Keep temporary
execution status in the implementation handoff, not in living context.

### 2. Prove the structure with Kitchen Menu

Coordinate with the current Kitchen source owner before touching overlapping
files. Align the Menu and Prep document-oriented groups while preserving Orders'
operational composition. Move the bounded operator group composition
to `kitchen/components/Workspace/Menu/`, reconcile scans and exclusions, and
align its Workspace composables to the path-led naming rule. Update real routes,
explicit imports, AI consumers, tests and generated declarations together.

Keep lower Menu Entity ownership at `runtime/menu/`. Preserve existing routes,
access decisions, standalone preparation, shared creation, record editing and
page publication. Recheck the reported zero-width Specials card link against
the current rendered source rather than assuming a naming move fixes it.

### 3. Simplify Kitchen-owned records

Item is the first implemented owned-Record source cutover: its canonical
identity and unchanged storage metadata are in `kitchen/records/menus/items/item.ts`, its
selling contract is in `records/menus/items/item-offer.ts`, stateless normalization is in
`utils/item-identity.ts`, and its reader/context/mutation adapters share
`composables/items/`. Its existing detail and Menu consumers retain their
supported operation names and command authority. There is no `kitchen/item/`
mini-spine or forwarding source left behind.

Use that ownership boundary when evaluating other support records. Item's
persisted `kitchens/{kitchenId}/dishes/{dishId}` path is unchanged; a source
cutover is not permission to rename stored records.
Preparation now follows the same owned-Record boundary: its model is in
`kitchen/records/prep/preparations/preparation.ts`, its reader in `composables/preparations/`,
its patch validator in `utils/preparation-changes.ts`, and its existing trusted
create/update actions in `server/preparations/`. Current endpoints, operation
names, historical read normalization and Recipe relationships are retained. The
persisted `prep-items` collection is unchanged.
Remove empty retired directories once consumers move. Leave no proxy files or
second model at the old location.

### 4. Establish Recipe's independent domain contract

The agreed [ownership and Kitchen-use contract](../concepts/entities.md#recipe-ownership-and-kitchen-use)
is: every Recipe has one User owner; Kitchen explicitly adopts an immutable
version and accepts updates deliberately. Approved internal use survives the
owner leaving Kitchen or unpublishing the Recipe. Kitchen owns its association
and local Preparation bindings; it does not own or automatically edit the source
Recipe. A separate adapted Recipe is also User-owned.

Recipe models and validation now live at `runtime/recipe/`. The operator slice
uses `kitchen/workspace/prep/recipes/`; reads and commands remain Kitchen-scoped. Complete these bounded steps before claiming the independent target:

1. Establish an explicit User-owner mapping for existing Recipes. Retain exact
   current scope and provenance; creator/import stamps do not assign ownership.
   An unresolved owner blocks that record's data/authority cutover.
2. Define Recipe-owned version Records and Kitchen-owned use Records, including
   exact read/edit/adoption authority and retained internal access. Keep one
   canonical Recipe identity and explicit versions, rather than mutable copied
   definitions or a second Recipe authority.
3. Give the portable Recipe an embedded output description. Translate current
   `output_preparation_id` and Preparation input ids into Kitchen-owned bindings;
   resolve portable prepared-input references without inventing missing Recipe
   facts. Kitchens can bind the same definition differently.
4. Migrate the complete Recipe source spine and its real Kitchen consumers and
   adapters together. Preserve routes, identity, lifecycle and current authority
   through any intermediate source-only cutover. Then prove the intended User
   authority and approved-version behavior, including updates, owner departure,
   unpublishing, unlinking and exact cross-Kitchen access boundaries.
5. Perform any stored-data copy and retirement only under its separately
   reviewed plan, retained preimages, target verification and explicit mutation
   authority. Publishing/collaboration/transfer features need concrete contracts;
   this plan does not authorize exposing existing private Recipes.

Recipe owns its supported model, validation, version behavior and commands at
`runtime/recipe/`. Kitchen Prep owns its use and Preparation composition. Move
only real responsibilities; add no empty role directories or forwarding aliases.

### 5. Apply the proved convention to other Workspace families

Migrate one complete capability at a time across Project, Supplier, Portfolio,
Property and Business, following actual dependencies. Business already has a
`BusinessWorkspace*` component registration; inspect its real consumers rather
than treating the prefix as proof of complete alignment. Blank remains an
App-local development harness, not a product Entity package.

Retain real differences: Business currently has Profile/Create/Team; Project
has Apps/Ecosystem; Supplier has Catalogue/Ingredients/Items; Portfolio has
Properties; Property composes Reservations capabilities. Do not manufacture
identical capability lists, empty folders or one composable per visual element.

Navigation is a separate coordinated boundary: Core currently resolves
`Workspace<Entity>Navigation` dynamically. Preserve that integration ABI until
both lookup sites and all registered providers cut over together. Likewise,
Granite's Portfolio overview and Reservations' Property overview are explicit
higher-owner overrides. Their names, imports and priorities must move with the
base family's consumer cutover. Do not flip a whole scan prefix blindly.

## Verification and completion

For every slice, inspect the owner, real consumers and nearest maintained
sibling before editing. Preserve the accepted native Nuxt layout structure,
selection, authentication, exact mutation target, commands, read outcomes,
subscription disposal, SSR/hydration and stale-completion behavior.

Use the existing focused test and check commands documented in
[the IDE workflow](../../tools/ide/README.md). Select behavioral tests that prove
shared acquisition, parent absence, child reuse, scope changes, publication and
disposal. Verify registered component/import names, nested discovery, scan
exclusions, duplicate names, App overrides and direct imports. Run appropriate
package/App typechecks, lint, formatting and documentation link checks.

Finish with the actual consuming pages and interactions at relevant desktop
and mobile sizes. Verify shared creation in its modal and standalone hosts,
selection/navigation, missing/error/empty states and the separate record editor.
Passing source-shape checks or a typecheck alone is not acceptance.

Report functional evidence separately from FireUX fit: name the reused owners,
actual consumers and deliberate differences. No slice is complete while it has
duplicate authority, stale imports or scans, old-name aliases, known fit gaps,
or an unverified required consumer. A bounded completion is not a claim that all
Entities or stored data have migrated.

## Portable continuation

For a reading companion such as GPT Walker: explain this plan in its order,
starting with the one-sentence spine definition. Distinguish agreed decisions
from the version storage, exact authority and legacy-data transition still to
implement. Recipes are User-owned; Kitchens retain explicitly approved versions. Preparation
is an agreed Kitchen-owned Record; portable Recipe output is an embedded shape.
Use Kitchen Menu, Item and Preparation as concrete examples. Reading or discussing
the plan does not start a runtime or data migration.

For a coding agent: start with the live checkout and its current owners. This
file is the portable design and sequencing handoff, not a replacement for
AGENTS.md, scoped context, source inspection or current task coordination.
