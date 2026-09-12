# Core Models

Updated: 2026-09-12
Ref: a96854c86
Role: map, not canon

## Purpose

Keep the FireUX identity spine understandable: an App, an Ecosystem, and a
User are canonical records. Supporting records and infrastructure must not
become competing versions of them.

Current source is authoritative:

- `packages/core/fireux-core/src/runtime/app/models/app.model.ts`
- `packages/core/fireux-core/src/runtime/ecosystem/models/ecosystem.model.ts`
- `packages/core/fireux-core/src/runtime/user/models/user.model.ts`
- `packages/core/fireux-core/src/runtime/project/models/project.model.ts`
- `packages/core/fireux-core/src/runtime/app/models/app-user.model.ts`
- `packages/core/fireux-core/src/test/app-collection.test.mjs`
- `projects/fireux/fireux-app/app/tests/platform-apps-read.test.mjs`

These source paths implement the `runtime/<entity>/models` ownership mapped in
`runtime-filesystem.md`. Their movement changed no stored contract or
authority.

## Top-level entity hierarchy

```text
Project 1 <── Ecosystem.project_id ── many Ecosystems
Ecosystem 1 <── App.ecosystem_id ── many Apps
    └── apps/{appId} (locator only)

App 1 ──< AppUser >── 1 User
                         └── apps/{appId} (locator only)
```

App descriptive copy uses `name`, optional `short_name`, `tagline`, and
`description`. Social links and media remain optional nested groups. App has
no separate short/long biography fields; directory consumers select from the
same App identity rather than maintaining another descriptive record.

`App`, `User`, and `Ecosystem` are root entities. `AppUser` is the App-owned
relationship record connecting one App to one User, not another root. Every App
references one Ecosystem; neither Ecosystem nor User stores a reverse array
of App IDs on its root document. A minimal `users/{uid}/apps/{appId}` child
reference may locate an AppUser stored in another database; it is not a second
membership record and never grants access.

An Ecosystem likewise stores minimal `ecosystems/{ecosystemId}/apps/{appId}`
children so deletion can prove which Apps still point at it. `App.ecosystem_id`
remains authoritative; the reverse child grants no ownership or access.

`Ecosystem.project_id` is the required Project relationship. App has no
`project_id`; Project Apps follows Project → Ecosystem → App. The relationship
adds no ProjectApp record fields and needs no `project-app.model.ts`. Reverse
locator storage remains supported, but unused locator model declarations are
retired; a collection alone does not justify a model file.

User and Ecosystem begin with one live client document read and direct Create,
Update and Delete. App creation uses a trusted Project command or `initializeConfiguredApp`
workflow: its required Ecosystem relationship and administrator membership
are established by that workflow, with retryable cross-database reference
reconciliation. App has no primitive client or server Create. The other
entity facades expose four CRUD primitives without hidden relationship workflows. Cross-database verification,
relationship cleanup, media, secrets, and multi-document invariants may be
added later as explicitly named operations; they never replace or masquerade
as CRUD.

Server primitives remain only where supported beneath the entity owner. App
reads use its canonical decoder through live or directory readers; the unused
unchecked App server reader is removed. Primitive `create.ts` applies to User,
Ecosystem and AppUser; App uses trusted initialization. AppUser remains
physically owned by App at `runtime/app/server/app-user/`. These server functions are a second
execution lane for the same CRUD language, not an API requirement and not a
workflow registry. HTTP adapters and tenant behavior are outside this family.

| Entrance | Meaning |
| --- | --- |
| `useApp(id)` | One live App root with Read, Update and Delete |
| `useUser(id)` | One live User root with primitive CRUD |
| `useEcosystem(id)` | One live Ecosystem root with primitive CRUD |
| `useAppUser(appId, userId)` | One live App-owned relationship with the same public shape |
| `useUserSession()` | Auth, live User and AppUser, membership policy and derived access/read state |

The four client document readers reuse `useFirestoreRead`; their CRUD facades
preserve `data`, `pending`, `error`, and `outcome`. App and AppUser read the
owning App database; User and Ecosystem, including the Ecosystem collection,
read the identity database. App and User retain their domain normalization. App reads validate required
fields and project only canonical fields; unrelated stored metadata neither
hides a valid App nor becomes relationship authority. Stored-schema audits
remain responsible for detecting obsolete fields.

The native Core reader exposes documents and collections through the same
settled-data contract: idle, pending and failed bindings expose no retained
value. Error takes precedence over pending; deactivated bindings expose neither
an error nor pending state. `data` and the returned ref are the same read-only
view; VueFire retains subscription/cache ownership. A ready empty collection is
`empty`, while an absent document is `missing`. Domain composition must not
reinsert derived rows into a failed collection. The source-owned
`firestore-read-state.test.mjs` checks this shared boundary. Exact-id batches
have separate subscription composition and are not a second collection scan.

The primitive client CRUD files live directly under each owning entity's
`composables/` directory. App omits primitive Create; the other members use
Read, Create, Update and Delete. `useAppSession` is only a live composition of Auth, App, and AppUser;
it owns no cache, refresh, HTTP read, or manually patched projection.
`useUserSession` composes the owning live readers directly. Its aggregate
`pending`, `error` and `outcome` describe the same Auth/User/membership state;
the independent read states remain available. It does not instantiate private
account reads, mutation commands or card formatting. Screens that display
private account fields use `useUserAccount`; presentation uses `useUserView`
explicitly. App and User sessions have different responsibilities and reuse
the same AppUser reader without becoming one combined controller.

Dashboard Overview composes the individual User, App, AppUser and private
account readers because it displays their states independently. An AppUser
failure must not mark a valid App as unavailable, or vice versa. The User
editor receives only a User and its read outcome; the profile route composes
membership, subscription and account presentation beside it. Editors do not
receive whole session controllers.

These primitive APIs are not evidence of complete UX CRUD. User editing uses
`useUserProfileUpdate` and its trusted commands. Name creation/editing share
`user/utils/profile-validation.ts`; name/bio patches may contain either or both
fields. Avatar upload and attachment have a separate User-owned command at
`user/server/avatar/update.ts`. AppUser owns no separate avatar; its displays
hydrate the canonical User. AppUser administration (`useAppUsers`), guarded commands
(`runAppUserCommand`), and session actions (`useAppUserCommands`) are App-owned;
User may compose them but never stores their implementation.

App runtime/session reads use the owning database's live document readers.
App directory and public detail surfaces use HTTP readers; `useApps` composes
`useAppCollection`, including refresh and pagination. FireUX platform readers
aggregate configured named databases on the server. Transport is a surface
choice, not another App identity or storage owner.

`useXDelete` is the deliberately sharp, single-document client primitive and
is exposed as `delete` by the entity façade. Any future relationship-aware
removal must use a different, explicit operation name and must not redefine
Delete.

## App dimensions: one identity, separate responsibilities

An App record describes one product: its public identity, Ecosystem, role,
availability and joining policy. It is not itself a deployed application or a
workspace Entity such as Kitchen. Deployment configuration selects the running
App. AppUser relates a User to that App; tenant is an App role, not a separate
identity model.

### App fields and their visible use

| Responsibility | Stored fields | Acquisition and presentation |
| --- | --- | --- |
| Recognition | `name`, optional `short_name` | Trusted creation/settings commands; directory cards and detail use the name; compact branding can use short name |
| Meaning | optional `tagline`, `description` | App identity editor → settings command; cards prefer tagline and detail shows authored copy |
| Artwork | optional `media` URLs | App-owned local assets → trusted media sync; directory/detail consume stored images |
| Opening the product | optional `social_links.website` | App address editor updates only this nested field; another App's detail uses it as the opening URL; the current runtime uses its configured home path |
| Classification and visibility | `ecosystem_id`, `role`, `status` | Creation/lifecycle authority and public read filtering; not compulsory public card labels |
| Membership policy | optional `self_join_enabled` | Stored App policy, consumed by onboarding and trusted joining; membership is stored separately in AppUser |
| Provenance | `created`, `updated` | Trusted writes; operational metadata, not compulsory discovery content |

Core `app/components/Edit/Sections/About.vue` exposes name, tagline and
description; `Edit/Sections/Social.vue` exposes the public address. Both compose
existing editable fields and each calls `useAppSettings` directly. The parent
App editor composes sections and membership administration without relaying
field callbacks. `app/server/settings/update.ts`
validates the authenticated command. Adding a URL or saving an App definition
does not provision hosting. Other social/contact fields remain optional stored
fields, without a completed editor in this slice.

This boundary applies to App and its immediate Project/Ecosystem consumers;
it does not require other Entity families to copy App's runtime lifecycle.

| Dimension | Identity and scope | Owner and source |
| --- | --- | --- |
| Stored App | Document id in the owning database; `ecosystem_id` is the relationship authority | Core `app/models/app.model.ts` and `app/utils/readApp.ts` |
| Running application | Deployment configuration identifies the current App and database; a saved definition does not prove a deployment exists | Concrete App `nuxt.config.ts`, Core `config/app/runtime.ts` and `app/composables/config/FireUXConfig.ts` |
| Current App context | Configured App plus the authenticated User's membership in that App | Core `app/composables/useAppSession.ts`; composes Auth, `useAppRead` and `useAppUserRead` |
| Managed App | Explicit selected Project → its Ecosystems → Apps; selection does not change the running App | FireUX App `server/project/apps/read.ts`, `server/project/core/authority.ts`; Core `project/composables/useProjectApps.ts` with management enabled |
| Listed App | Explicit public directory/detail scope; no management authority comes from appearing in a list | Core `app/composables/useApps.ts`, `ecosystem/composables/useEcosystemApps.ts`; FireUX App `server/utils/apps.ts` |

The following distinctions must survive changes to these surfaces:

- Changing a selected Project or managed App must not change the configured
  runtime App, database, or current AppUser membership.
- Runtime configuration owns deployment wiring. The saved App owns editable
  identity. Initialization may seed identity from configuration; ordinary reads
  must not silently replace saved identity with configuration defaults.
- Public Project detail and Project management are distinct access contexts.
  An explicit Project id scopes a relationship; the trusted management endpoint
  separately checks the operator's authority before reading it.
- Directory/card projections may select and derive presentation fields. They
  do not persist another App, grant membership, or become relationship authority.
- Project workspace placement does not create `projects/{id}/apps/{id}` as a
  competing canonical App. Future private support follows the domain that owns
  it and references the canonical App rather than copying its identity.
- Nesting social links or media is organization within the App document, not a
  privacy boundary. Public eligibility and private access require explicit
  reader/Rules enforcement.

Verification must exercise these boundaries, not just filenames: a selected
Project different from the runtime App's Project; multiple Ecosystems; public
versus operator access; inactive definitions; pagination; late responses after
selection/account changes; and unchanged document identity across projections.
Current focused evidence is `src/test/app-collection.test.mjs` in Core and
`app/tests/platform-apps-read.test.mjs` and `app/tests/project-apps-read.test.mjs`
in FireUX App. These cover only their encoded behavior; they do not prove all
five dimensions or deployment isolation end to end.

Public App collection and detail readers exclude inactive definitions; Project
management retains them. Ecosystem exploration uses explicit parent-scoped
reads. App featuring has no admin curation page or App-specific settings
accessor. Core relationship composables still assume FireUX App platform routes
exist; portability is not proved. Primitive write authority and relationship-aware
decommissioning also need their own bounded verification.

## Stored records

| Record          | Meaning                                      | Authority                                                        |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| `App`           | One App definition; deployment is separate                 | `apps/{appId}` in its owning App database                        |
| `Ecosystem`     | The product family an App may belong to      | `ecosystems/{ecosystemId}` in the identity database              |
| `EcosystemMeta` | Local discovery projection of that Ecosystem | `(default)/ecosystem/{ecosystemId}` in its Firebase host project |
| `Project`       | One FireUX control-plane Project             | `projects/{projectId}` in the FireUX named database              |
| `ProjectMeta`   | Local discovery projection of that Project   | `(default)/project/{projectId}` in its Firebase host project     |
| `User`          | One person                                   | `users/{uid}` in the identity database                           |
| `AppUser`       | That User's membership in one App            | `apps/{appId}/users/{uid}` in the owning App database            |
| `UserAppReference` | Cross-database locator for that AppUser   | `users/{uid}/apps/{appId}` in the identity database              |
| `EcosystemAppReference` | Cross-database locator for an App     | `ecosystems/{ecosystemId}/apps/{appId}` in the identity database |

Each Firebase project's `(default)` database carries bounded singular
`project/{projectId}` and `ecosystem/{ecosystemId}` local records. Canonical
App identity, presentation, membership, and domain state remain in the owning
named database.

The FireUX platform App index reads canonical Apps from each registered named
database through one trusted server boundary. Its configured targets are
infrastructure routing, not stored App identity. `useEcosystemApps(id)` reads
the matching parent-scoped endpoint. Both expose `App[]`; no second App domain
model is required for directory transport.

`AppUser` takes both identities from its path
`apps/{appId}/users/{uid}`. The document stores membership facts and its
created/updated stamps; it does not repeat `app_id` or `id`. The current type
also names Kitchen, Project, Property, Portfolio, Supplier and Blank
relationships. Those domain-specific fields are identified ownership debt,
not the intended consumer-agnostic Core contract; their reconciliation is
tracked in `docs/roadmaps/identity-and-workspaces.md`. Runtime membership
commands write the canonical shape and do not carry legacy cleanup branches.
`useAppUsers` is the live collection reader. Shared presentation rows live in
`app/models/app-user-summary.ts`: membership fields plus one nested, nullable
User summary. Missing identities retain their membership rows. There is no
second administrative users HTTP endpoint or envelope. This live reader relies
on Firestore Rules for data access; signed-in client gating is not administrator
authorization. Membership mutations retain their trusted command checks.
App settings edits use the authenticated settings endpoint and its validator;
the caller explicitly rejects a target other than the configured runtime App.
App membership is not an
App Team. Developer and operator teams belong to canonical Projects under
`projects/{projectId}/team/{uid}` and are managed from the FireUX control plane.
After the canonical AppUser transaction succeeds, the trusted membership
workflow idempotently reconciles its UserAppReference. Cross-database writes
cannot be atomic, so retrying the command repairs an interrupted reference
write. Historical memberships use the dry-run-by-default
`scripts/reconcile-user-app-references.mjs`; the reference never replaces an
AppUser existence or authorization check.

Trusted App initialization also reconciles the EcosystemAppReference after the
canonical App transaction. Client App Update deliberately rejects `ecosystem_id`; creation uses trusted
initialization and movement requires a trusted relationship workflow. Historical repair is dry-run by default through
`scripts/reconcile-ecosystem-app-references.mjs`.

Root Delete removes exactly the selected root document. It does not archive,
cascade, reconcile relationships, delete Firebase Auth, or invoke a hidden
server plan. Those are separate product operations to design only when a real
consumer requires them.

App role has exactly three product meanings: `global`, `tenant`, and
`standalone`. Ecosystem identity is represented by `Ecosystem`, while internal
system behavior is not an App role.

`EcosystemMeta` follows the same projection rule. The canonical Ecosystem keeps
identity, presentation, and stamps in its named database; the local meta adds
only the named `database_id` needed for routing. Ecosystem document ID is route
identity, so no duplicate stored slug exists in either shape.

`runtime/ecosystem/composables/useEcosystem.ts` is the canonical root entrance.
Presentation and publishing workflows consume it separately; they are not
alternate Ecosystem identities.

`ProjectMeta` follows the same local-registry boundary. Canonical Projects stay
in the FireUX control-plane named database, each Project owns its
`team/{uid}` access records, and the local meta adds only the named
`database_id` once that Project has a provisioned product database. An inactive
empty Project shell therefore has no ProjectMeta yet. Project document ID is
route identity, so neither Project shape stores a duplicate slug.

The entity-facing Project stack lives under `runtime/project`.
`useProjects` reads canonical `Project[]` from the public Server collection,
and `/projects/:id` reads the same strict entity shape from its exact Server
endpoint. `useProjectCollection` separately reads the caller's target-bounded
control-plane scope for the private Workspace. There is no
`ProjectDirectoryEntry` or browser mutation entrypoint;
presentation mapping remains in `useProjectInterface`; `/` owns the FireUX App
Project Workspace landing and private operations remain under
`/workspace/project/*`.

The Project Workspace may expose capabilities backed by existing authority and
one thin empty-shell Create doorway. Its Team sheet reads the selected
Project's `team/{uid}` records through a membership- and Team-authorized server
endpoint and resolves canonical User presentation. Project notifications remain undefined until a real
Project-scoped emitter and User-owned delivery contract exist.

The FireUX control-plane named database keeps canonical `projects/{projectId}`
roots for every Project added to the Workspace. Root management, exact Project
Team records, and AppUser membership determine which roots an App Workspace
may expose; there is no App-nested Project access record.

`UserAccount` and User notifications are private, User-scoped support records.
They are not additional User identities. Profile bases, directory DTOs,
stamps, and entity declarations are shared model utilities, not core records.

## Library ownership

| Library                           | Owns                                                                                                                                                              | Does not own                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `runtime/app/models`              | Canonical App and App-owned membership/support contracts                                                                                                          | User identity, generic app-shell state, configuration   |
| `runtime/ecosystem/models`        | Canonical Ecosystem and its owned projection contracts                                                                                                            | App or project identity                                 |
| `runtime/user/models`             | Canonical User and User-owned private support contracts                                                                                                           | App membership or generic profile fragments             |
| `runtime/project/models`          | Canonical Project control-plane and Project-owned support contracts                                                                                               | Module packages or App module configuration             |
| `runtime/models`                  | Reusable data-contract fragments and projections: stamps, scope, Workspace Entity access, profiles, entity declarations, directories, and shared style vocabulary | Entity-owned records, access decisions, or Vue state    |
| `runtime/types`                   | Runtime and UI coordination types that are not stored models                                                                                                      | Persisted entity authority                              |
| `runtime/utils`                   | Derived runtime behavior such as access, avatar, and scope normalization                                                                                          | Canonical stored shape                                  |
| `config/app`                      | Authored App composition and literature contracts                                                                                                                 | Firestore records                                       |
| `runtime/<entity>/{models,utils}` | Domain policy proved by that entity, such as Kitchen currency display                                                                                             | Generic Core vocabulary without another domain consumer |

## Entity model file shape

Each entity model file owns a distinct domain contract. Stored records,
transport responses, presentation and configuration remain distinguishable;
a collection does not require another model or metadata declaration. Retain
only declarations with real source consumers. Runtime seed objects use the
`Defaults` suffix; `Model` is not used for a value or an alias for an entity.

The former `scripts/` suite has been removed. Script and guard references in
historical migration descriptions below are not runnable verification. Current
checks live with the source packages and App tests.

The former `models/core`, `models/system`, and entity-owning parts of
`models/operations` have moved into App, Ecosystem, User, and Project. Root
models retain shared contracts only; no compatibility re-export bridge is
accepted.

Module composition is source controlled through extension packages and App
configuration. There is deliberately no generic Firestore `Module` model.
Authored `app/meta.ts` content remains source configuration. Stored `AppMeta`
does not exist; source presentation configuration is not an alternate App
identity or Firestore model.

## Identity rules

- Firestore document IDs are stable identity. Public route keys are declared
  per family and never selected through a silent `slug || id` fallback.
- User identity has one root at `users/{uid}`. Its Firebase Auth UID remains
  stable while `handle` is an editable User field; no parallel handle lookup,
  reservation, migration-state, fallback-read, or duplicate-write collection
  is part of the canonical family.
- Kitchen root IDs are stable operational identity and currently follow the
  linked Place ID. The authored Kitchen slug is the public route key; one
  Kitchen-owned bounded server resolver maps it to the root and rejects
  duplicates. Internal relationships use the root ID, never the route slug.
  User handles and other reviewed authored route keys retain their own explicit
  family contracts.
- `AppUser` owns App membership, independent role and subscription, and onboarding.
  Workspace target access follows the current AppUser's explicit Entity
  association; Team records own roster labels and linked people.
- Product access resolves to Free when AppUser is absent. That effective default
  creates neither identity nor membership. Stored Premium and Business enable
  Premium capabilities; only Business enables multi-Workspace ownership.
- Nuxt config selects and composes an App; it must not silently become another
  App database. Normal runtime reads must not repair canonical identity from
  duplicated config values.
- Firebase project, database, storage, and service-account values are
  infrastructure bindings owned by ecosystem configuration. They are not
  Ecosystem identity.

## Named projection debt

The owner-first target excludes reconciled or duplicated values. AppUser
membership determines App access, `users/{uid}/profiles/{kind}` determines
profile state, and each AppUser Entity association determines Workspace access.
User-owned target arrays and App-nested Workspace access records are migration
sources only.

Current `App` has no derived user count or database/repository/build metadata.
Historical stored fields, where present, are not domain authority. A type-only
cleanup does not prove their deletion from Firestore; stored-data removal needs
its own source and data audit.

## Migration order

1. Keep App, Ecosystem, User, and Project in their current entity model scopes;
   do not recreate a generic canonical-entity bucket or change stored
   authority through a filesystem edit.
2. Resolve App data from the App database and Ecosystem/User data from the
   identity database; canonical stacks must not use an ambiguous default.
3. Replace Nuxt-driven identity repair with an explicit provisioning command
   and a read-only current-App context.
4. Move User profiles and Order links beneath User, and move Workspace Team and
   operations beneath each root before retiring old target/support records.
5. Collapse App database metadata to one infrastructure source and remove
   stored-id/slug duplication only after route and data migrations are proven.

`pnpm align:onboarding` now audits Ecosystem/EcosystemMeta alongside User and
App. Its default is a dry run; an apply requires the exact plan hash and a
protected preimage backup under `/private/tmp`.

Each migration is a separate bounded pass. Passing TypeScript does not prove a
stored-data migration is complete.

## Project App capability

Project Apps management uses the authenticated Project-scoped Apps endpoint.
It queries Ecosystems by `project_id`, resolves their configured database bindings, then
queries Apps by `ecosystem_id`. The browser receives only the selected Project
collection. Missing bindings and invalid records are errors, not empty results.
Both `useProjectApps(id)` and `useEcosystemApps(id)` receive an explicit parent
and share `useAppCollection` transport state. Public relationships query that
parent at source and expose active Apps only; management retains Project
operator authorization and includes inactive definitions. All return App
records with `CollectionPage` metadata, not another domain model.

The general FireUX `/apps` directory uses bounded per-database queries and a
shared document-id cursor through `readAppRecords` and `appCollectionPage`.
A failed source fails the page rather than advancing past unseen records.
Small parent relationships return the full scoped collection with a null
cursor. Sitemap and directory-count aggregation remain separately unpaged.
The existing `useUserCollection`, `useEcosystemCollection`, and
`useProjectCollection` retain their domain-owned live readers and outcome state;
HTTP App pagination is an intentional transport difference.

### Browser creation proof

The Project Apps capability can save an inactive App definition in the current
FireUX Ecosystem using its existing named database. The trusted command verifies
Project access and Ecosystem ownership, creates the App and initial AppUser in
one transaction, then reconciles their reverse locators idempotently. It requires
an explicit tenant or standalone role; this role does not provision infrastructure.
Cross-Ecosystem creation is not implemented by this bounded command.

`app/utils/renderAppPreview.ts` renders standalone, escaped HTML from the saved
App's name and description. The browser displays it in a sandboxed preview and
can download that source. This proves browser creation and reopening; it is not
a generated Nuxt project, a deployment, or Granite's Portfolio domain.

## App read ownership

`useAppRead` owns the native canonical document read used by App CRUD,
session identity and Shell initialization. Its `exists` result distinguishes
a missing document from an existing document whose fields need repair; pending
or failed reads never trigger initialization. Failed reads hide retained App
data. Shell observes this binding directly, without a status stream or a
post-initialization refresh callback. Initialization and its environment checks
mount only when the missing-App setup surface is shown. The ordinary `/api/app/status` GET remains
for the User bootstrap's one-shot policy check.

`useAppDetail` owns the live public HTTP detail result,
including source changes, missing records and errors. Both Core and FireUX App
public detail routes render App-owned `app/components/Detail/Page.vue`, which
consumes it; the route supplies its endpoint because the
server owns local versus platform-wide visibility. Public detail must not use
the raw session reader to bypass active-App and ecosystem filtering.
`useAppCollection` owns paged HTTP App results for directories and explicit
parent relationships. These are distinct authorized read scopes over App,
not competing App models. App detail and collection tests live in Core's
`src/test/app-detail.test.mjs` and `src/test/app-collection.test.mjs`.

## User read lifecycle

User single and collection CRUD reads share `useFirestoreRead` against the
identity database. Handle lookup owns one reactive query binding and resolves
its exact matching id through `useUserRead`; it must not cache a subscription
per visited handle or fall back to rows from a previous handle. Private
notification results carry the requesting owner id and are hidden immediately
when that owner is no longer active. Public profile readers expose no retained
entries while their source reports an error. Handle and notification lifecycle cases are covered
by Core `src/test/user-read-lifecycle.test.mjs`; transport-wide behavior remains
a separate verification boundary.

User read paths follow responsibility: root identity reads, including
`useUserByHandle`, live directly under `user/composables`; profile detail and
collection readers live under `user/composables/profile`; notification reads
live under `user/composables/notifications`. Consumers import these owners
directly; retired transport-based read paths have no compatibility wrappers.

The active reconciliation scope and deferred optional profiles are tracked in
[Identity and Workspace roadmap](../roadmaps/identity-and-workspaces.md).
Profiles are not a prerequisite for ordinary Workspace access; domain-specific
capabilities retain their own explicit requirements.

AppUser-derived UI authority requires a `ready` membership read. Pending,
missing, idle and failed reads provide no elevated authority even if a binding
retains previous data. Trusted commands retain their own server authorization.

## App public exploration

App journeys are separated into Explore, Manage and Create. The public App
index composes the App collection reader, search and compact shared cards;
public detail uses `app/components/Detail.vue` for identity, authored description
and an entry action. For the configured App, entry uses its runtime home path.
Other Apps require their stored HTTP(S) website address; missing addresses do
not justify deriving a hostname from the App id. Management and creation use
their own existing routes and authorities, not duplicate App identities.
See `docs/roadmaps/identity-and-workspaces.md` for current journey acceptance.
