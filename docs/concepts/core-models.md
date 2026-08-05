# Core Models

Updated: 2026-08-04
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

| Record      | Meaning                                 | Authority                                             |
| ----------- | --------------------------------------- | ----------------------------------------------------- |
| `App`       | One deployed product surface            | `apps/{appId}` in its owning App database             |
| `Ecosystem` | The product family an App may belong to | `ecosystems/{ecosystemId}` in the identity database   |
| `User`      | One person                              | `users/{uid}` in the identity database                |
| `AppUser`   | That User's membership in one App       | `apps/{appId}/users/{uid}` in the owning App database |

Each Firebase project's `(default)` database also carries a bounded singular
`project/{projectId}` local record plus plural `ecosystems` and `apps`
directory projections for only the things hosted by that Firebase project.
Those safe routing and presentation records
are not canonical identity or operational storage; canonical App membership
and domain state remain in the owning named database.

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

Module composition is source controlled through extension packages and App
configuration. There is deliberately no generic Firestore `Module` model.
Likewise, App meta content is authored configuration, not a system record.

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

The current stored contract still contains reconciled or duplicated values:

- `User.app_ids`
- `User.profiles`
- `AppUser.profiles`
- `AppUser.console_enabled`
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
4. Remove `AppUser.console_enabled`, then replace or formally reconcile
   `User.app_ids`, profile indexes, and `App.derived.user_count` one projection
   at a time.
5. Collapse App database metadata to one infrastructure source and remove
   stored-id/slug duplication only after route and data migrations are proven.

Each migration is a separate bounded pass. Passing TypeScript does not prove a
stored-data migration is complete.
