# Tenant and global App family

Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose

Map the recurring runtime difference between ecosystem/global Apps and tenant
Apps without forking the package-owned domain system.

## Links

- Parents: `app-config.md`, `console.md`
- Horizontal: `family-console-entity.md`, `family-menu.md`,
  `tool-provider.md`, `pages.md`
- Runtime sources: `FireUXConfig.ts`, `useConsole.ts`, and each App's
  `nuxt.config.ts`

## Shared spine

Global and tenant Apps must:

- Declare App role once through FireUX config.
- Read App role through `useFireUXConfig` and Console behavior through
  `useConsole`; domains do not recreate role detection.
- Operate the same package-owned entity, Console, operation, and mutation
  contracts.
- Resolve a bounded target set before selecting or reading scoped data.
- Derive storage/authority scope from the selected target and fixed runtime,
  never from a caller-provided collection path or host guess.
- Keep public route scope separate from data ownership scope.
- Treat target pinning as configuration, not as an ownership transfer.
- Reject cross-App target conflicts instead of silently copying, reclaiming, or
  merging data.

## Runtime behavior matrix

| Concern | Global App | Tenant App | Why the delta exists |
| --- | --- | --- | --- |
| Example | Misebox | La Tap Berne | Product composition |
| App role | `global` | `tenant` | Explicit runtime identity |
| Target source | Bounded UserApp membership/authority | `consoleConfig.<family>.targetIds` | Global users may operate several targets; tenants pin a known set |
| Selection | User chooses among authorized targets | One configured target may auto-select | Tenant removes redundant choice, not authority checks |
| Create default | Allowed unless family config disables it | Disabled unless family config enables it | Tenant Apps usually manage an existing bounded target |
| Public routes | Often explicit entity/directory scope | May omit the configured target segment | Tenant App already supplies the bounded scope |
| Domain implementation | Owning package | Same owning package | App role is composition, not a domain fork |

`standalone` is a third FireUX-owned App role. It shares explicit config and
package contracts; it must not become an implicit fallback for unknown roles.

## App-scope vocabulary

- App role is `tenant`; the corresponding entity support scope is
  `tenant_app`.
- `parent_app` means the entity's App support record is owned by the
  ecosystem/global App.
- `tenant_app` means the support record is owned by the tenant App.
- `root_only` means the entity has no App support record.
- `dedicated_app` is legacy migration input only. New writes use `tenant_app`.
- Global and standalone roles write `parent_app`; tenant writes `tenant_app`.
  Unknown roles receive no ownership default.

These values classify support ownership. They do not create a second entity
identity.

## Accepted deltas

| Delta | State | Reason |
| --- | --- | --- |
| Tenant auto-selects one configured target | `accepted` | The configured target is already bounded; the shared Index still owns selection validity |
| Global App shows a user-specific target chooser | `accepted` | A global ecosystem can expose several authorized targets |
| Tenant may disable target creation | `accepted` | A branded tenant commonly operates an existing business instead of onboarding competitors |
| Tenant Menu detail is `/<menuId>` while directory detail includes Kitchen scope | `accepted` | Route scope is implicit in tenant config but explicit in a multi-Kitchen directory |
| Tenant apps own app-local brand and presentation components | `accepted` | Reusable domain truth stays package-owned while the tenant remains visually bespoke |

## Ownership and transfer

- Creating an App record does not transfer a pinned entity from another App.
- A new tenant-owned entity may be created directly with `tenant_app` support.
- Attaching an existing root owned by another App must stop and use an explicit
  transfer workflow.
- Writers preserve a family's current support-path representation until that
  family is deliberately migrated.
- A transfer must inventory the complete support subtree. Copying one Firestore
  document does not copy its subcollections.
- The fixed safe phase order is inspect source → copy complete support tree →
  verify destination → repoint root → delete source last.

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
- Provider preview URLs are not public Menu ownership or routing authority.

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

| Difference | State | Required direction |
| --- | --- | --- |
| Stored `dedicated_app` values | `migration` | Normalize through reviewed family migrations to `tenant_app` |
| Transfer executor is absent | `to-confirm` | Define authentication, recursive inventory, backup, verification ledger, and recovery before live use |
| La Tap Berne is the only mature tenant page-composition reference | `to-confirm` | Compare a second tenant before extracting generic Tenant Page components |
| Hard-coded tenant ids, hosts, or domain branches in reusable packages | `drift` | Replace with App config, target authority, or entity support data; do not add another branch |
| Domain logic implemented separately in a tenant project | `drift` | Move reusable behavior to the owning package and leave app-local composition in the tenant |

## Alignment roadmap

### Now

- Keep role detection in FireUX config and Console mode in `useConsole`.
- Keep global and tenant consumers on the same family core and mutations.
- Fail closed on missing or conflicting target configuration.

### Next

- Remove legacy `dedicated_app` data through explicit migrations.
- Design and verify the authenticated transfer executor.
- Use a second tenant to confirm which Page/Backdrop/Hero layers are reusable.

### Later

- Extract generic tenant presentation primitives only after repeated source
  proves the same contract.
- Extend multi-target tenant behavior only when a real product requires it;
  configured count alone must not silently change route grammar.
