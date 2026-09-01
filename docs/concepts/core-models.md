# Core Models

Updated: 2026-08-23
Ref: d1a7d5eec
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

## The simple spine

| Record          | Meaning                                      | Authority                                                        |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| `App`           | One deployed product surface                 | `apps/{appId}` in its owning App database                        |
| `Ecosystem`     | The product family an App may belong to      | `ecosystems/{ecosystemId}` in the identity database              |
| `EcosystemMeta` | Local discovery projection of that Ecosystem | `(default)/ecosystem/{ecosystemId}` in its Firebase host project |
| `Project`       | One FireUX control-plane Project             | `projects/{projectId}` in the FireUX named database              |
| `ProjectMeta`   | Local discovery projection of that Project   | `(default)/project/{projectId}` in its Firebase host project     |
| `User`          | One person                                   | `users/{uid}` in the identity database                           |
| `AppUser`       | That User's membership in one App            | `apps/{appId}/users/{uid}` in the owning App database            |

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

App role has exactly three product meanings: `global`, `tenant`, and
`standalone`. Ecosystem identity is represented by `Ecosystem`, while internal
system behavior is not an App role.

`EcosystemMeta` follows the same projection rule. The canonical Ecosystem keeps
identity, presentation, and stamps in its named database; the local meta adds
only the named `database_id` needed for routing. Ecosystem document ID is route
identity, so no duplicate stored slug exists in either shape.

The entity-facing Ecosystem read/view stack currently lives under
`composables/fireux/ecosystem`: `useEcosystemDetail` resolves one bounded DTO,
`useEcosystemInterface` maps presentation, and `useEcosystemSeo` owns metadata.
Raw identity-database collection adapters currently remain under
`composables/fireux/firestore/core/ecosystem`. Both paths move together to the
Ecosystem entity scope; Ecosystem creation and publishing are trusted
provisioning operations, and no client mutation or umbrella `useEcosystem()`
entrypoint owns them.

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
