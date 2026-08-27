# Sharer ecosystem map

Updated: 2026-08-27
Ref: 1813a2f9e
Role: map, not canon

## Purpose

Map the Sharer ecosystem, its free global App, and its branded tenant-App
product boundary.

## Links

- Parent: `fireux-mono.md`
- Family registry: `spine.md`
- Scoped context: `../ai/sharer-context.md`
- Runtime package: `runtime-package.md`
- App configuration: `app-config.md`
- Tool provider: `tool-provider.md`
- Brand assets: `brand-assets.md`
- Product language: `product-language.md`

## Family and nearest siblings

- Family: ecosystem identity/config runtime packages under
  `packages/ecosystem/fireux-*` and their registered global/tenant Apps.
- Nearest ecosystem sibling: `fireux-slap` for a small experience-led global
  App; nearest tenant sibling: Yellow Velo for a separately branded tenant App.
- Must match: Core ecosystem wiring, explicit Firebase binding, named database,
  App registry authority, global/tenant roles, Hosting configuration, complete
  App-owned asset families, PWA behavior, and guard coverage.
- May differ: Share Profile records, ordered link behavior, public sharing
  presentation, free Sharer attribution, and tenant-specific brand composition.

## Product boundary

Sharer owns one persistent Share Profile whose ordered links can be presented
through the naked `/shared/:handle` public doorway. Every route beneath
`/shared/**` renders without the ordinary App shell by default. The global App provides the free Sharer-branded
experience. A premium customer receives a genuine tenant App with its own name,
brand assets, installable PWA, Hosting target, and direct profile doorway.

Public profile reading remains anonymous. A signed-in App admin or configured
FireUX developer receives a management doorway from the otherwise public
surface; Core-owned Auth and guarded dashboard routes remain the authority for
that access.

Kjordi is the first real tenant. It proves the tenant registration, brand
boundary, and App-bound Share Profile path. The package owns one persisted
`share_profiles/{appId}` document, a guarded social-links admin editor, and an
anonymous public reader. The first tenant proves the social-link button and Go
QR presentation path. Supported platforms may also derive optional public
metadata from the saved social URL; YouTube channel statistics are the first
proof. Enrichment flattens comparable follower, content, view, reaction,
comment, share, and profile-view values without converting missing values to
zero or claiming cross-platform followers are unique people. A failed or
unconfigured enrichment never hides the underlying link.

Go QR remains a provider. Sharer supplies a profile or link URL as the target
and owns why that target is shared. The provider owns QR transport and
rendering. Neither side copies the other's data authority.

## Current source and guards

- `packages/ecosystem/fireux-sharer/src/module.ts`
- `packages/ecosystem/fireux-sharer/src/runtime/share-profile`
- `packages/ecosystem/fireux-sharer/src/runtime/pages/dashboard/admin/social-links.vue`
- `packages/ecosystem/fireux-sharer/src/config/firebase/ecosystem.config.ts`
- `packages/ecosystem/fireux-sharer/src/config/firebase/rules/share-profile.rules`
- `packages/ecosystem/fireux-sharer/src/config/module/runtime-config.ts`
- `projects/sharer/sharer-app/nuxt.config.ts`
- `projects/sharer/kjordi/nuxt.config.ts`
- `scripts/firebase/sharer/firebase.json`
- `scripts/firebase/sharer/firestore.rules`
- `scripts/firebase/sharer/firestore.indexes.json`
- `scripts/_lib/app-registry.mjs`
- `scripts/guards/ecosystem.mjs`
- `scripts/guards/projects.mjs`

## Delta register

| Difference                                                                      | State      | Reason or alignment trigger                                                                                                                              |
| ------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sharer is a domain ecosystem rather than an Apps That Slap tenant               | `accepted` | Sharing profiles and customer PWA creation define the parent product family and its commercial boundary                                                  |
| The free App uses `sharify.web.app`                                             | `accepted` | `sharer.web.app` is reserved by another Firebase project; Sharer remains the stable product and technical key                                            |
| Kjordi owns a separate tenant App and Hosting site                              | `accepted` | The premium product is a customer-owned branded PWA, not a themed route in the global App                                                                |
| Kjordi has no App-local profile content                                         | `accepted` | Tenant and non-tenant social links use the same persisted Share Profile model; the tenant App owns identity and presentation, not a parallel data source |
| Kjordi sends each selected social URL to Go QR                                  | `accepted` | Sharer owns the social target and interaction; Go QR continues to own QR transport and rendering                                                         |
| Share Profiles use one public App-keyed document with membership-guarded writes | `accepted` | Tenant and global Apps use the same persisted model while App identity remains the ownership and presentation boundary                                   |

## Verification and maintenance

Build/type-check the ecosystem package, run ecosystem and project guards,
smoke both root routes, then run `pnpm guard`. Update this map when Share
Profile authority, the free/premium boundary, or QR dependency direction
changes. Keep profile content and temporary launch state out of this map.
