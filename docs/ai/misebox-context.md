# Misebox GPT Context

Updated: 2026-09-06
Ref: d9a306e3f
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
- A guest arriving at `/` is already in the Kitchen Workspace, even before
  saving Kitchen information. Getting started describes its content state;
  it does not mean the Workspace is absent. The Kitchen/Place creation and
  onboarding commands retain their distinct persistence and authority roles.
- The Main App owns `/`, navbar/SEO framing, and App-specific Kitchen entry
  copy and workflow starters in `app/pages/index.vue`. The root composes Core
  `WorkspaceStart` presentation with Kitchen-owned controls. Authored brief
  starters are not executable compound tools.
- Kitchen Workspace exposes Calendar from the shared top bar rather than as a
  sidebar destination. Calendar opens on the current date and moves through dates;
  Calendar and Notifications appear only for a signed-in user whose selected
  Kitchen root is active. Kitchen identity/presentation completion remains a
  separate progression and does not redefine onboarding lifecycle completion;
  focused current-day work belongs on `/` once onboarding prerequisites prove
  that the Kitchen is ready for that operational landing state.
- Kitchen's `useKitchenWorkspace` exposes the selected Entity as
  `{ data, id, outcome, crud }`. `useKitchenWorkspaceIndex` owns the collection,
  its read outcome, and selection. Neither owns page JSON; each page owns its
  bounded inspector projection and capability-specific props.
  Kitchen selection is a local App-scoped preference through Core
  `useWorkspace`; it does not invoke the account primary-change command or
  reapply that primary when a consumer mounts. The Choices child is presentation
  only; its Selector parent owns the collection reader. The Index reconciles
  only a completed collection result: keep a valid choice, select the first
  available Kitchen otherwise, and clear only a confirmed empty result.
  The Kitchen-owned `Workspace/Navigation.vue` supplies the persistent selected
  identity and switcher to the Core sidebar through package registration.
  Pending and error outcomes do not become onboarding or clear the selection.
- `fireux-kitchens` owns `WorkspaceKitchenAI`, `WorkspaceKitchen`, target
  loading, selection, creation, authority, and operational capability
  components. Each route supplies its own Kitchen Hero copy directly to the
  shared `WorkspaceHero` primitive.
- Kitchen-enabled tenant Apps receive the authenticated thin
  `/workspace/kitchen` doorway. Their `/` route and brand remain App-owned.
- Non-Kitchen Misebox Apps receive no Kitchen pages, components, plugins, or
  server handlers.
- An App declares `workspaces: ['kitchen']`; `fireux-misebox` conditionally
  installs `fireux-kitchens`. Apps do not repeat the extension module.

Registration is guarded by `scripts/guards/ecosystem.mjs`,
`runtime-registration.mjs`, and `workspace-pages.mjs`.

The App-owned public `/api/fireux/context/product` response also publishes a
bounded identity (name, description, HTTPS image and App URL). FireUX consumes
this as a live projection for connected Project Identity and Overview; it is not
a write-back into the Project root or a replacement for Kitchen/Place identity.

## Kitchen and Place

- Canonical Kitchen domain identity is exactly `id`, `identity_source`, `slug`,
  `status`, and `visibility`; audit stamps and proved Kitchen operation
  configuration remain separate root concerns. `identity_source` is `user` for
  an explicitly created shell and `place` when onboarding selects a Place; it
  is independent of Place classification.
- A name-only Kitchen shell may use a generated id while being manifested, but
  its name is persisted on the same-id Place rather than copied onto Kitchen.
- Same-id Place owns venue name, tagline/presentation, address/geo, media,
  classification, price level, currency/timezone, and business hours.
- Kitchen Team owns membership, roles, permissions, invitations, and mutation
  authority. Its shared CRUD editor receives Kitchen-defined access-role options
  and editability; operational `job_title` remains separate from access authority.
  Kitchen Identity composes Place-owned venue fields rather than extending a
  universal Core identity schema. Its basic venue form is Place-owned under
  `place/components/Edit/Identity.vue` and submits one sparse patch through
  `usePlaceUpdate`; Kitchen AI only prepares that same form. The page inspector
  and AI context contain the selected Place id and supported identity fields,
  never a whole Kitchen, User or Team. Images, opening hours, publication and
  theme retain their named native controls. Missing Place and failed reads are
  distinct from loading. Identity controls use the authorized Kitchen Team
  reader, not a display projection flag. The existing Place mutation boundary
  checks the same-id Kitchen/Place relationship, current App membership and
  active exact owner/operator Team authority; retired Kitchen management and
  `place_id` fields are not authority. Kitchen Team create/edit supports optional
  free-text `job_title` through the explicit `jobTitle` command input. Suggestions
  belong to the Kitchen job-title field; they are not an enum or access policy.
  AI uses null to preserve a title and an empty string to clear it in the same
  human editor. The onboarding compound still handles access and invitations;
  title requests use create/update.
- The Main App's User detail composition may append the Kitchen-owned
  `KitchenUserMemberships` relationship surface for the viewed User. Its
  trusted projection is limited to the User themself or a current-App
  administrator/developer, resolves canonical Kitchen and same-id Place
  records, and reports matching Team access without moving Kitchen meaning into
  Core User or mutating inconsistent records.
- Menus and Orders remain their own records beneath their proved owner. Every
  newly created Kitchen atomically receives protected draft `food` and `drinks`
  system Menus, with `food` selected as its initial `menus.primary_menu_id`.
  Their parent-scoped ids may repeat across Kitchens; public root Menu
  projections remain separate and use Kitchen-qualified ids when these defaults
  are published.
- Operations is a Workspace grouping, never a generic stored field.
- Tables remain Front-of-House unless explicit ownership is proved.
- App-support and legacy Kitchen-root operational maps are migration preimages,
  not authority.

Read current Kitchen and Place models plus
`docs/concepts/family-workspace-entity.md`,
`docs/concepts/place-kitchen-media.md`, `docs/concepts/menu-ordering.md`, and
the current Kitchen source and package/entity guards. The retired
migration-specific Kitchen guard remains available in Git history.

## Capability storage and migration

Kitchen Team's organisational role catalogue lives at
`kitchens/{kitchenId}/roles/{roleId}`. Each role owns its name; Team members
reference selected stable ids in `role_ids`. Suggestions are optional authored
starting points, not automatically created records. The Team Roles surface uses
named domain commands and the shared label/assignment mechanics under Core
`server/utils/workspace-team/roles.ts`. These labels do not introduce permission
rules. Legacy access-role fields and job titles remain a separate migration
concern; do not infer that a catalogue label grants authority.

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
- Kitchen Team creation currently allows three active members on Free, seven
  on Professional, and unlimited active members on Business. The trusted Team
  create command enforces the limit; temporary page selection does not alter
  Team membership or AppUser state.
  Team management controls use the Kitchen-bound availability returned by the
  authorized Team reader; a display projection’s `can_write` field is not their
  authority. Every mutation still rechecks the actor on the Server.
- Administrative/developer previews do not create domain authority exceptions.
- Protected operational data is absent from public Kitchen/detail projections.
- The current Misebox Firestore Rules source is deliberately development-open;
  it does not decide whether a Kitchen operation belongs to Client or Server.
  Domain `useXCreate`, `useXUpdate`, and `useXDelete` operations make that
  transport decision from relationship, transaction, secret, and authority
  requirements. The live Firebase project retains its last deployed Rules
  until an explicit Rules deployment.
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
and `scripts/guards/capability-tools.mjs`.

Kitchen Test owns its bounded intent endpoint under
`fireux-kitchens/src/runtime/kitchen/server/test/intent.ts`. It uses the existing
FireUX AI provider with only the prompt, Test records, selection, and available
CRUD actions. The result prepares the existing human dialog; trusted Test
commands remain the mutation boundary. Core supplies the optional presentation
callback without depending on the AI extension. Project Test uses the same callback through FireUX-owned AI composition;
Kitchen does not own or import that provider adapter.

Kitchen Team owns the equivalent bounded dialog-intent endpoint under
`fireux-kitchens/src/runtime/kitchen/server/team/intent.ts`. It prepares the
existing Team dialogs without performing membership mutations. This consumer
opts into Codex with a lower model in development through the existing FireUX
AI transport; production retains the configured provider. Other Kitchen AI
consumers retain their existing integration boundaries.
Kitchen Team presents basic person CRUD, workspace role labels and a separate
copy-invitation action. Core’s shared role catalogue includes fixed Dev and
Operator labels alongside workspace-defined roles. Assigning these labels does
not change the separately retained access record. `kitchen/models/team.model.ts` defines the four-field
person profile; `kitchen/utils/team-record.ts` retains the existing persistence
and access representation for current consumers. That compatibility record is
not the editable profile and is not a template for new Team features. Existing
stored extras are preserved, not migrated or erased. The dossier-import and
bundled enrolment workflows are retired; AI prepares basic person controls and
directs role assignment to the selected-person panel.
`useKitchenWorkspaceTeam` is the page command entrypoint for create, update,
deactivate and invitation preparation. `useKitchenTeamData` combines one live
member collection with an authorised account-identity projection; these have
different responsibilities and are not interchangeable read implementations.
Create uses the shared person form directly. The former Team AI suggestion
composables and forwarding Write component are retired. Linked names are
projected from the User account, and the Team update command rejects renaming
a linked record. Existing generic tool executors remain adapters to the same
trusted commands for external AI consumers; they do not reimplement writes.


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

## App product context

The Misebox App owns its bounded product context at
`apps/misebox-app/context/product` in its runtime database. Its implementation
lives in the concrete App: `server/app/context`, the matching `server/api/app/context`
adapters, and `app/pages/dashboard/context.vue`. This is App-specific product
background, not a universal context registry or operational Kitchen state.

The reader requires current Misebox App admin/developer membership, projects
only supported fields, and returns a content revision and source path. The
read-only AI consumer rereads that source and rejects a mismatched preview
revision. It supplies context to `fireux-ai`; the AI package owns neither
source discovery nor access policy. Source context is background data, not
trusted instructions. App context works without a FireUX Project connection.
Published product context is separate from this internal draft record. The App-owned
`server/fireux/context/product.ts` publishes explicitly authored public literature
through `/api/fireux/context/product`, with schema version 1, public visibility,
a bounded description and content revision. It requires no caller credentials,
Project relationship or Firestore read. Never project internal draft context or
operational records into that public response automatically.

FireUX Project Overview validates and displays this public response. Its internal
page endpoint retains Project operator authorization, but the outbound public
request carries no token. The current reader configures only the Misebox Project;
other child Apps and generated-App template installation remain unimplemented.
The previous draft-sharing command and UI are retired. Historical stored grants
have no effect on public discovery.
The public integration uses no service-account impersonation or cross-database
access. App-owned server credentials still protect any future database-backed
publication writer; public read access does not authorize writes.
Development-open Rules still prevent describing stored context as private;
this record contains only non-sensitive product background.
