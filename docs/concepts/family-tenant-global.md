# Tenant and global App family

Updated: 2026-08-20
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map the recurring runtime difference between ecosystem/global Apps and tenant
Apps without forking the package-owned domain system.

## Links

- Parents: `app-config.md`, `workspace.md`
- Horizontal: `family-workspace-entity.md`, `family-menu.md`,
  `tool-provider.md`, `pages.md`
- Runtime sources: `FireUXConfig.ts`, `useWorkspace.ts`, and each App's
  `nuxt.config.ts`

## Shared spine

Global and tenant Apps must:

- Declare App role once through FireUX config.
- Read App role through `useFireUXConfig` and Workspace behavior through
  `useWorkspace`; domains do not recreate role detection.
- Operate the same package-owned entity, Workspace, operation, and mutation
  contracts.
- Resolve a bounded target set before selecting or reading scoped data.
- Derive storage/authority scope from the selected target and fixed runtime,
  never from a caller-provided collection path or host guess.
- Keep directory route scope separate from data ownership scope.
- Treat target pinning as configuration, not as an ownership transfer.
- Reject cross-App target conflicts instead of silently copying, reclaiming, or
  merging data.

## Runtime behavior matrix

| Concern               | Global App                               | Tenant App                               | Why the delta exists                                                       |
| --------------------- | ---------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| Example               | Misebox                                  | La Tap Berne                             | Product composition                                                        |
| App role              | `global`                                 | `tenant`                                 | Explicit runtime identity                                                  |
| Target source         | Root management + Team + AppUser          | Root management + Team + AppUser          | Entity Team owns Workspace access; AppUser proves App membership           |
| Selection             | User chooses among authorized targets    | One persisted target may auto-select     | Tenant removes redundant choice, not authority checks                      |
| Create default        | Allowed unless family config disables it | Disabled unless family config enables it | Tenant Apps usually manage an existing bounded target                      |
| Directory routes      | Often explicit entity/directory scope    | May omit the persisted target segment    | Authorized target selection supplies the bounded scope                    |
| Domain implementation | Owning package                           | Same owning package                      | App role is composition, not a domain fork                                 |

`standalone` is a third FireUX-owned App role. It shares explicit config and
package contracts; it must not become an implicit fallback for unknown roles.

## Entity management vocabulary

App role remains `global`, `tenant`, or `standalone`. Workspace roots use one
separate management relationship:

- `{ mode: 'root' }` has no App host;
- `{ mode: 'workspace' }` uses the ecosystem Workspace App convention; and
- `{ mode: 'app', app_id }` names a dedicated App host.

Management affects host and App-admin override, never the Entity path. Former
`parent_app`, `tenant_app`, `root_only`, and `dedicated_app` support-scope values
are migration input only and receive no new writes.

## Accepted deltas

| Delta                                                                           | State      | Reason                                                                                    |
| ------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Tenant auto-selects one persisted target                                        | `accepted` | The authorized target is already bounded; the shared Index still owns selection validity  |
| Global App shows a user-specific target chooser                                 | `accepted` | A global ecosystem can expose several authorized targets                                  |
| Tenant may disable target creation                                              | `accepted` | A branded tenant commonly operates an existing business instead of onboarding competitors |
| Tenant Menu detail is `/<menuId>` while directory detail includes Kitchen scope | `accepted` | Route scope is implicit in tenant config but explicit in a multi-Kitchen directory        |
| Tenant apps own app-local brand and presentation components                     | `accepted` | Reusable domain truth stays package-owned while the tenant remains visually bespoke       |

## Ownership and transfer

- Creating an App record does not transfer a root from another host.
- A new tenant-managed Entity is created at its canonical root with
  `{ mode: 'app', app_id }` and root-owned Team.
- Attaching an existing root managed by another App requires an explicit
  transfer workflow.
- A transfer updates the root management relationship and verifies Team and
  AppUser authority. The root, Team, and operations do not move collections.
- The fixed safe phase order is inspect authority → retained preimage → update
  management → verify old and new access → retire obsolete membership support.

The shared transfer planner is currently dry-run only. It is evidence for the
required sequence, not permission to perform a live migration.

## Menu route delta

- The Menu family requires exactly one configured tenant Kitchen today.
  Missing, multiple, or nonexistent targets are configuration errors; there is
  no fallback to global data.
- Tenant root routes omit the Kitchen slug. Directory routes carry it
  explicitly, but a client slug cannot alter ownership.
- `/menus` redirects temporarily to `/<menuId>` only when a bounded server
  result proves exactly one published menu and no next page.
- Zero menus render an empty index; multiple menus render the tenant list.
- Tenant Menu details remain `/<menuId>` if more menus are added later.
- Provider preview URLs are not Menu ownership or routing authority.

## Tenant page composition

La Tap Berne is the current proving sibling, not a universal template yet.

Its useful composition is:

1. App-local Page frame.
2. Shared app-local Backdrop.
3. App-local Hero with a page content slot.
4. Package-owned domain content.

The Page stays boring, Backdrop owns imagery/wash, Hero owns title and intro,
and route files read as a short composition recipe. Tenant-specific naming is
accepted while only one mature tenant proves the shape.

## Migration and drift register

| Difference                                                            | State        | Required direction                                                                                    |
| --------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| Stored support-scope values                                          | `migration`  | Replace them with root management and Team through reviewed family migrations                         |
| Transfer executor is absent                                           | `to-confirm` | Define authentication, recursive inventory, backup, verification ledger, and recovery before live use |
| La Tap Berne is the only mature tenant page-composition reference     | `to-confirm` | Compare a second tenant before extracting generic Tenant Page components                              |
| Hard-coded tenant ids, hosts, or domain branches in reusable packages | `drift`      | Replace with App config, target authority, or entity support data; do not add another branch          |
| Domain logic implemented separately in a tenant project               | `drift`      | Move reusable behavior to the owning package and leave app-local composition in the tenant            |

## Alignment roadmap

### Now

- Keep role detection in FireUX config and Workspace mode in `useWorkspace`.
- Keep global and tenant consumers on the same family core and mutations.
- Fail closed on missing or conflicting target configuration.

### Next

- Remove legacy support-scope data through explicit migrations.
- Design and verify the authenticated transfer executor.
- Use a second tenant to confirm which Page/Backdrop/Hero layers are reusable.

### Later

- Extract generic tenant presentation primitives only after repeated source
  proves the same contract.
- Extend multi-target tenant behavior only when a real product requires it;
  configured count alone must not silently change route grammar.

## App directory source boundaries

The FireUX platform directory consumes
[PLATFORM_APP_TARGETS](../../projects/fireux/fireux-app/server/config/platform-directory-targets.ts),
including Ecosystem databases and declared standalone App databases. Its App
list, detail and Project-scoped readers use those App sources. Ecosystem identity
readers continue to use PLATFORM_DIRECTORY_TARGETS; adding an App source does
not create another Ecosystem identity.

The shared Core `/api/apps` directory reads the configured runtime database's
root `apps` collection and filters the canonical `ecosystem_id`. App ownership
remains in its existing database; the platform does not maintain duplicate root
App records. The named Ecosystem reverse locator identifies the App's database
without granting membership. Both directory implementations currently select
active records. Route presentation does not change these acquisition boundaries.
