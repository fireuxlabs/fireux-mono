# Core Models

Updated: 2026-08-09
Ref: d232cc731
Role: map, not canon

## Purpose

Keep the FireUX identity spine understandable: an App, an Ecosystem, and a
User are canonical records. Supporting records and infrastructure must not
become competing versions of them.

Current source is authoritative:

- `packages/core/fireux-core/src/runtime/models/core/app.model.ts`
- `packages/core/fireux-core/src/runtime/models/core/ecosystem.model.ts`
- `packages/core/fireux-core/src/runtime/models/core/user.model.ts`
- `scripts/guards/entity-authority.mjs`
- `scripts/guards/user-app-access.mjs`

## The simple spine

| Record          | Meaning                                      | Authority                                                        |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| `App`           | One deployed product surface                 | `apps/{appId}` in its owning App database                        |
| `AppMeta`       | Local discovery projection of that App       | `(default)/apps/{appId}` in its Firebase host project            |
| `Ecosystem`     | The product family an App may belong to      | `ecosystems/{ecosystemId}` in the identity database              |
| `EcosystemMeta` | Local discovery projection of that Ecosystem | `(default)/ecosystem/{ecosystemId}` in its Firebase host project |
| `Project`       | One FireUX control-plane Project             | `projects/{projectId}` in the FireUX named database              |
| `ProjectMeta`   | Local discovery projection of that Project   | `(default)/project/{projectId}` in its Firebase host project     |
| `User`          | One person                                   | `users/{uid}` in the identity database                           |
| `AppUser`       | That User's membership in one App            | `apps/{appId}/users/{uid}` in the owning App database            |

Each Firebase project's `(default)` database also carries bounded singular
`project/{projectId}` and `ecosystem/{ecosystemId}` local records plus plural
`apps/{appId}` AppMeta projections for only the things hosted by that Firebase
project. Those safe routing and presentation records
are not canonical identity or operational storage; canonical App membership
and domain state remain in the owning named database.

The FireUX platform directory reads those local projections directly from each
registered Firebase project through one trusted server boundary. Its guarded
target registry is infrastructure routing, not another stored directory or
identity authority. A missing target or projection fails explicitly instead of
silently publishing an incomplete platform directory.

`AppMeta` is part of the App family but is not another Entity. It keeps only
the local Project/Ecosystem/database pointers, App role and status, public
identity and media, website route, Console-family discovery, and projection
update stamp. It excludes membership, User ids and counts, moderation,
repository/build metadata, join policy, and operational content.
The trusted runtime initialization, media, and App-settings writers maintain
the current App's projection idempotently. Operator migrations and App
scaffolding use the MCP/Skill lane for the same projection contract; Client
code never writes `(default)`.

App role has exactly three product meanings: `global`, `tenant`, and
`standalone`. Ecosystem identity is represented by `Ecosystem`, while internal
system behavior is not an App role.

`EcosystemMeta` follows the same projection rule. The canonical Ecosystem keeps
identity, presentation, and stamps in its named database; the local meta adds
only the named `database_id` needed for routing. Ecosystem document ID is route
identity, so no duplicate stored slug exists in either shape.

The entity-facing Ecosystem read/view stack lives under
`composables/fireux/ecosystem`: `useEcosystemDetail` resolves one bounded DTO,
`useEcosystemInterface` maps presentation, and `useEcosystemSeo` owns metadata.
Raw identity-database collection adapters remain under
`composables/fireux/firestore/core/ecosystem`. Ecosystem creation and publishing
are trusted provisioning operations; no client mutation or umbrella
`useEcosystem()` entrypoint owns them.

`ProjectMeta` follows the same local-registry boundary. Canonical Projects stay
in the FireUX control-plane named database, `AppProject` owns FireUX Console
access, and the local meta adds only its named `database_id`. Project document
ID is route identity, so neither Project shape stores a duplicate slug.

The entity-facing Project stack lives under `composables/fireux/project`.
`useProjectCollection` reads the caller's target-bounded control-plane endpoint,
`useProjectDetail` selects one Project from that bounded result, and
`useProjectInterface` maps presentation. `/projects` is the public collection of
active Project identity and presentation DTOs. It never exposes access,
database credentials, team, or operational state. There is no public Project
detail route and no browser Firestore read or mutation entrypoint; private
selection and operations remain under `/console/project`.

The read-only Project Console may expose operations backed by existing
authority. Its Team operation reads the selected Project's `AppProject`
operator/team ids through an admin-only server endpoint and resolves their
canonical User presentation. It does not create a second Project membership
model. Project notifications remain undefined until a real Project-scoped
emitter and User-owned delivery contract exist.

The FireUX control-plane named database keeps canonical `projects/{projectId}`
roots for every Project added to the Console. Its
`apps/{appId}/projects/{projectId}` AppProject records are access-only support
and determine which roots that App Console exposes.

`UserAccount` and User notifications are private, User-scoped support records.
They are not additional User identities. Profile bases, directory DTOs,
stamps, and entity declarations are shared model utilities, not core records.

## Library ownership

| Library                          | Owns                                                                                                                                                            | Does not own                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `models/core`                    | The canonical `App`, `Ecosystem`, and `User` records plus the `AppUser` membership contract                                                                     | Account support, workflows, formatting, configuration   |
| `models/system`                  | The canonical `Project` control-plane record                                                                                                                    | Module packages or App module configuration             |
| `models/operations`              | Workflow contracts and their owned records: membership, account provisioning, notifications, conversations, events, and publication                             | A second version of a core identity                     |
| `models/utils`                   | Reusable data-contract fragments and projections: stamps, scope, Console Entity access, profiles, entity declarations, directories, and shared style vocabulary | Normalizers, access decisions, formatters, or Vue state |
| `runtime/types`                  | Runtime and UI coordination types that are not stored models                                                                                                    | Persisted entity authority                              |
| `runtime/utils`                  | Derived runtime behavior such as access, avatar, and scope normalization                                                                                        | Canonical stored shape                                  |
| `config/app`                     | Authored App composition and literature contracts                                                                                                               | Firestore records                                       |
| Extension-owned models and utils | Domain policy proved by that extension, such as Kitchen currency display                                                                                        | Generic Core vocabulary without another domain consumer |

## Entity model file shape

Core entity model files use one order: vocabulary, canonical entity,
supporting records, storage declarations, entity declaration, defaults, then
command inputs. Runtime seed objects use the `Defaults` suffix; `Model` is not
used for a value or as an alias for the entity type. Each stored record has its
own storage declaration, so an App support record never shares a combined
storage object with its canonical root.

Module composition is source controlled through extension packages and App
configuration. There is deliberately no generic Firestore `Module` model.
Authored `app/meta.ts` content remains source configuration. Stored `AppMeta`
is the separate bounded local-registry projection derived from canonical App
and authored App configuration; neither becomes an alternate App identity.

## Identity rules

- Firestore document IDs are stable identity. Public route keys are declared
  per family and never selected through a silent `slug || id` fallback.
- User identity has one root at `users/{uid}`. Its Firebase Auth UID remains
  stable while `handle` is an editable User field; no parallel handle lookup,
  reservation, migration-state, fallback-read, or duplicate-write collection
  is part of the canonical family.
- Kitchen currently exposes its document ID as the public slug and direct-reads
  that document. The existing mutation path that can write a different stored
  slug is migration debt; it does not establish an independently mutable
  Kitchen route key. User handles and other reviewed authored route keys retain
  their own explicit family contracts.
- `AppUser` owns App membership, role, premium entitlement, and onboarding.
  Console target access belongs to each Console Entity's App-support record.
- Nuxt config selects and composes an App; it must not silently become another
  App database. Normal runtime reads must not repair canonical identity from
  duplicated config values.
- Firebase project, database, storage, and service-account values are
  infrastructure bindings owned by ecosystem configuration. They are not
  Ecosystem identity.

## Named projection debt

The simplified source model excludes reconciled or duplicated values. The
2026-08-05 bounded User migration removed the User/AppUser copies from every
current named database. Membership documents now determine App access, profile
document existence determines profile state, and owner navigation targets live
only at `users/{uid}/private/targets`:

- `project_ids`
- `kitchen_ids`

Remaining non-User projection debt is:

- `App.derived.user_count`
- App database and repository/build metadata

These fields are not new identity authority. Do not remove them with a type-only
cleanup: migrate readers, writers, Rules, guards, and stored records together.

## Migration order

1. Keep `models/core` limited to the three canonical model files and keep all
   App/User vocabulary with its owner.
2. Resolve App data from the App database and Ecosystem/User data from the
   identity database; canonical stacks must not use an ambiguous default.
3. Replace Nuxt-driven identity repair with an explicit provisioning command
   and a read-only current-App context.
4. Keep User readers, writers, Rules, and stored records on the completed
   minimal shape; migrate remaining App projections such as
   `App.derived.user_count` independently.
5. Collapse App database metadata to one infrastructure source and remove
   stored-id/slug duplication only after route and data migrations are proven.

`pnpm align:onboarding` now audits Ecosystem/EcosystemMeta alongside User and
App. Its default is a dry run; an apply requires the exact plan hash and a
protected preimage backup under `/private/tmp`.

Each migration is a separate bounded pass. Passing TypeScript does not prove a
stored-data migration is complete.
