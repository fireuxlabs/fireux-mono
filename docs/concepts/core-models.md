# Core Models

Updated: 2026-09-04
Ref: 918a6655c
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
- `scripts/guards/entity-authority.mjs`
- `scripts/guards/user-app-access.mjs`
- `scripts/guards/runtime-ownership.mjs`

These source paths implement the `runtime/<entity>/models` ownership mapped in
`runtime-filesystem.md`. Their movement changed no stored contract or
authority.

## Top-level entity hierarchy

```text
Ecosystem 1 <── App.ecosystem_id ── many Apps
    └── EcosystemAppReference (locator only)

App 1 ──< AppUser >── 1 User
                         └── UserAppReference (locator only)
```

`App`, `User`, and `Ecosystem` are root entities. `AppUser` is the App-owned
relationship record connecting one App to one User, not another root. An App
may reference one Ecosystem; neither Ecosystem nor User stores a reverse array
of App IDs on its root document. A minimal `users/{uid}/apps/{appId}` child
reference may locate an AppUser stored in another database; it is not a second
membership record and never grants access.

An Ecosystem likewise stores minimal `ecosystems/{ecosystemId}/apps/{appId}`
children so deletion can prove which Apps still point at it. `App.ecosystem_id`
remains authoritative; the reverse child grants no ownership or access.

`project_id` on App and Ecosystem is optional legacy catalogue provenance. It
is not parent identity and new code must not use it to infer ownership. Project
is a control-plane record outside this top-level product graph.

Every root begins with one live client document read and direct Create, Update,
and Delete. The entity façade exposes those four CRUD primitives without
silently adding relationship workflows. Cross-database verification,
relationship cleanup, media, secrets, and multi-document invariants may be
added later as explicitly named operations; they never replace or masquerade
as CRUD.

The same first family exposes server `read.ts`, `create.ts`, `update.ts`, and
`delete.ts` files beneath each entity owner. AppUser remains physically owned
by App at `runtime/app/server/app-user/`. These server functions are a second
execution lane for the same CRUD language, not an API requirement and not a
workflow registry. HTTP adapters and tenant behavior are outside this family.

| Entrance | Meaning |
| --- | --- |
| `useApp(id)` | One live App root with aligned CRUD |
| `useUser(id)` | One live User root with aligned CRUD |
| `useEcosystem(id)` | One live Ecosystem root with aligned CRUD |
| `useAppUser(appId, userId)` | One live App-owned relationship with the same public shape |
| `useUserSession()` | Authentication, private account, and `useAppSession()` composition |

The aligned client CRUD files live directly under each owning entity's
`composables/` directory and use the same Read, Create, Update, and Delete
language. `useAppSession` is only a live composition of Auth, App, and AppUser;
it owns no cache, refresh, HTTP read, or manually patched projection.
`useUserSessionRead` and `useAppUserSessionRead` remain explicitly named views
over their owning live readers. AppUser administration (`useAppUsers`), guarded commands
(`appUserMutation`), and session actions (`useAppUserActions`) are App-owned;
User may compose them but never stores their implementation.

`useXDelete` is the deliberately sharp, single-document client primitive and
is exposed as `delete` by the entity façade. Any future relationship-aware
removal must use a different, explicit operation name and must not redefine
Delete.

## Stored records

| Record          | Meaning                                      | Authority                                                        |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| `App`           | One deployed product surface                 | `apps/{appId}` in its owning App database                        |
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
database through one trusted server boundary. Its guarded target registry is
infrastructure routing, not stored App identity. Ecosystem App indexes use the
same `useApps()` collection family against their scoped Server endpoint. Both
return `App[]`; no App directory or AppMeta model exists.

`AppUser` takes both identities from its path
`apps/{appId}/users/{uid}`. The document stores only membership facts and its
created/updated stamps; it does not repeat `app_id` or `id`. Runtime membership
commands write the canonical shape and do not carry legacy cleanup branches.
The authenticated `/api/internal/app/users` endpoint is an administrative
projection of these AppUsers plus bounded User identity summaries. It is not an
App Team. Developer and operator teams belong to canonical Projects under
`projects/{projectId}/team/{uid}` and are managed from the FireUX control plane.
After the canonical AppUser transaction succeeds, the trusted membership
workflow idempotently reconciles its UserAppReference. Cross-database writes
cannot be atomic, so retrying the command repairs an interrupted reference
write. Historical memberships use the dry-run-by-default
`scripts/reconcile-user-app-references.mjs`; the reference never replaces an
AppUser existence or authorization check.

Trusted App initialization also reconciles the EcosystemAppReference after the
canonical App transaction. Basic client App Create and Update deliberately
reject `ecosystem_id`; establishing or moving that relationship requires a
trusted relationship workflow. Historical repair is dry-run by default through
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
`ProjectDirectoryEntry`, browser Firestore read, or browser mutation entrypoint;
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

Core entity model files use one order: vocabulary, canonical entity,
supporting records, storage declarations, entity declaration, defaults, then
command inputs. Runtime seed objects use the `Defaults` suffix; `Model` is not
used for a value or as an alias for the entity type. Each stored record has its
own storage declaration and sits beneath its honest owner.

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
  Workspace target access belongs to each Workspace Entity's `team/{uid}`
  record.
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
profile state, and each Workspace Entity's `team/{uid}` record determines
Workspace access. User-owned target arrays and App-nested Workspace access
records are migration sources only.

Remaining non-User projection debt is:

- `App.derived.user_count`
- App database and repository/build metadata

These fields are not new identity authority. Do not remove them with a type-only
cleanup: migrate readers, writers, Rules, guards, and stored records together.

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
