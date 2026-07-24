# Spine

Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose

Explain how FireUX finds and protects repeatable system shape without turning
every historical difference into an exception.

Prefer the word `spine`. A spine is a shared shape proved by current source,
guards, and working siblings. Domain deltas are allowed only after the shared
shape is visible.

## Before editing

1. Name the family.
2. Name the nearest working sibling.
3. Name what must match.
4. Name what may differ and why.
5. Patch the smallest useful slice.

If a difference has no reason, treat it as drift. If the reason is temporary
compatibility, treat it as migration debt rather than a permanent family delta.

## Delta test

Every observed difference belongs to exactly one state:

- `accepted`: keep it because product meaning, authority, or data ownership
  requires it.
- `migration`: remove it after a named migration or compatibility cutover.
- `drift`: align it because no reviewed reason exists.
- `to-confirm`: do not build more ceremony until the product decision exists.

An accepted or migration delta must name its reason, owner, source evidence,
and alignment or removal trigger. See `documentation.md` for the full writing
contract.

## Family registry

| Family | Map | Strongest current evidence | Current status |
| --- | --- | --- | --- |
| Console entity | `family-console-entity.md` | `scripts/guards/console-indexes.mjs` | Index spine is strong; lifecycle sheets still vary |
| Public index | `family-public-index.md` | Route pages plus collection-manager contracts | Data authority is strong; page presentation has drift |
| Public detail | `family-public-detail.md` | Bounded SSR projections and route pages | Transport rule is strong; route identity and actions are incomplete |
| Tenant/global | `family-tenant-global.md` | App config, `useFireUXConfig`, and `useConsole` | Runtime mode is shared; transfer and second-tenant proof remain incomplete |
| Menu | `family-menu.md` | Entity declarations and menu route guard | Identity and route contexts are strong; content migration remains active |
| Menu ordering | `menu-ordering.md` | Menu route grammar, order models, and lifecycle composables | One lifecycle is mapped; the older funnel tree remains migration debt |
| Collection manager | `collection-manager.md` | Shared directory components, manager siblings, and CSS guards | Ownership roles are clear; presentation classes still need deliberate classification |
| Create | `create.md` | `useXCreate` siblings, trusted endpoints, and `createStrategy.ts` | Create families are classified; plan metadata and optional-field handling are not aligned |
| Tool provider | `tool-provider.md` | Core registry, loader, iframe protocol, and provider APIs | Transport is shared; Go QR wrappers and dogfood config contain duplication |
| AI document processing | `ai-document-processing.md` | `fireux-ai` document loop and Kitchen Menu adapter | Ownership is clear; only one domain adapter has proved the shared contract |
| Translation and reviewed copy | `translation.md` | Sproochli copy model, Kitchen attachment/Menu projection, trusted draft endpoint, and copy guard | Authority and attachment are shared; reviewed-copy persistence and reviewer UI remain to-confirm |
| Firestore entity stack | `firestore-entity.md` | `scripts/guards/canon.mjs` and entity authority guards | Folder spine is guarded; family-specific reads differ by authority |
| Server API | `server-api.md` | Package registration and shared server primitives | Placement is clear; no-op hooks and repeated authority parsing remain |
| Runtime package | `runtime-package.md` | Module wiring and package guards | Registration spine is shared; package lanes own deliberate deltas |
| App config | `app-config.md` | `defineFireuxConfig`, Nuxt overrides, and `FireUXConfig` | Runtime role is explicit; repeated project defaults are drift |
| Brand assets | `brand-assets.md` | Core source family plus `scripts/guards/fireux-brand-assets.mjs` | FireUX identity is Core-owned; parent ecosystem and App projections are guarded |
| Project user monitor | `project-user-monitor.md` | App join events, OIDC receiver, and FireUX admin feed | Bounded signup projection is shared; production source scopes require deployment |
| Layout | `layouts.md` | `AppShell` and current runtime layouts | Ownership is clear; slot versus direct route rendering is `to-confirm` |
| Debug | `debug.md` | `DevJson` and `DevFireuxDebugPanel` | Two distinct surfaces are accepted; a third generic panel is drift |

## Stop signals

- A tiny behavior needs many unrelated files.
- A helper name hides confusion instead of naming a real seam.
- A new layer duplicates an existing core seam.
- A project app starts owning reusable domain behavior.
- A family difference is described but not classified.
- Documentation calls current drift an accepted pattern without evidence.

## Current recommendations

### Now

- Keep the guard-backed Console index and Menu route spines intact.
- Use explicit delta registers in family maps.
- Keep source and guards above prose in the authority order.
- Preserve root `Menu` versus scoped `KitchenMenu` as separate entity and
  create contracts.
- Remove no-op parity files and new pass-through helpers instead of treating
  file-count symmetry as architecture.

### Next

- Align public-index presentation where no product reason explains the current
  split.
- Resolve route identity per public-detail entity instead of changing all
  `[id]` and `[slug]` routes mechanically.
- Remove Kitchen compatibility identity only through a reviewed migration.
- Reconcile descriptive entities with the executable matrix before adding more
  root or scoped ceremony.
- Consolidate the duplicate Go QR wrappers and dogfood payloads behind the
  existing provider contract.
- Move the old Kitchen order funnel tree onto the mapped Menu Order lifecycle.

### Later

- Promote repeated, proven family contracts into guards.
- Do not guard unresolved product choices or cosmetic prose.
- Prove a second AI document domain before generalizing review persistence.
- Test the two layout renderer lanes before choosing or guarding one syntax.
- Promote `CreatePlan` metadata only if real consumers need to query it.
