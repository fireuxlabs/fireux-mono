# Handover Alpha 7 New — App configuration cull proposal

2026-11-26 — New to Old and Codex. New remains incumbent. Architectural review requested, not implementation authority. Respond as Alpha 8 Old if historical reasoning adds value. Codex should hold implementation until the user and New agree the contract.

## Why this handoff
Codex's Alpha 6 source trace confirms the shared native SSR App Detail pipeline already works conceptually for ecosystem-bound Blank and Misebox: configured App ID -> existing scoped public reader -> Firestore `apps/{id}` -> public projection -> shared Detail card. Misebox's page header still hardcodes its name. The current reader requires private ecosystem scope and stored `ecosystem_id` even for standalone; it does not implement a trusted self-acquisition contract for ecosystem-free standalone Apps. No new store, provider, builder or orchestration layer was justified.

The developer now wants a **brutal simplification of the old Misebox ecosystem configuration**, removing anything that does not belong to the running App's assembly/identity or whose authoritative owner is Firestore. Do not confuse removing a property from this config with deleting a working module, feature, record, security check or product capability.

## Old configuration under review
```ts
import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

export default defineFireuxEcosystem({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'misebox-app',
  context: 'Misebox connects public Kitchen and Menu discovery with a Kitchen Workspace for operators. Venue information, menu content and operational configuration have separate owners.',
  name: 'Misebox',
  shortName: 'Misebox',
  homePath: '/',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  domains: ['kitchens', 'jobs', 'chefs', 'ingredients'],
  profiles: ['chef', 'professional', 'agent', 'customer', 'driver'],
  seo: { staticPaths: ['/', '/product', '/get-started', '/programme'] },
  modules: [
    ['fireux-kitchens', { ordering: { channels: ['pos', 'kiosk', 'website'] } }],
    'fireux-places',
    'fireux-businesses',
    'fireux-go-qr',
    'fireux-sproochli',
    ['fireux-suppliers', { mode: 'consumer' }],
    ['fireux-jobs', { categories: ['hospitality'] }],
  ],
  extends: [
    'fireux-misebox/kitchen-layer',
    'fireux-core/layer',
    'fireux-places/layer',
    'fireux-businesses/layer',
    'fireux-jobs/layer',
  ],
})
```
This is supplied historical configuration; it is **not** verified as the current reset implementation or active source. The present native `nuxt.config.ts` and reset canon take precedence.

## Proposed ownership test (not canon yet)
- **Keep in native Nuxt assembly/deployment config, when actually needed:** running App ID (trusted self selector), Nuxt modules and layers/extends, module-specific build/runtime wiring, and genuine route/SEO build declarations. Firebase project/database/credentials remain server-owned environment settings; do not conflate the old `projectId` string with Firebase project or a FireUX Project entity. Verify which declared extensions are actually needed before reintroducing them.
- **Move to authoritative Firestore App document / runtime-derived public data:** display `name`, `shortName`, `contactEmail`, public `homePath` where it is App metadata, `role`, ecosystem membership and public branding. The legacy free-text `context` belongs only if a concrete App record contract/use exists, not by default.
- **Remove from this generic App config until a demonstrated owner/consumer requires them:** `domains`, `profiles` registries and duplicated `ecosystem`/`ecosystemId`/`projectId` aliases. Domain features and profile types should be declared by the appropriate extension/feature contracts if needed, not promoted to universal App identity metadata. Do not silently delete domain logic or user profiles.
- **Treat `seo.staticPaths` distinctly:** the list of routes is build/deployment configuration if still used; SEO title/description/brand content must derive from the authoritative App record as appropriate. Do not move route assembly into Firestore by reflex.
- **Retain only the minimum necessary server-side ecosystem constraint for trust:** optional membership for standalone remains settled; scope enforcement for member deployments and peer queries cannot be removed merely because the redundant old metadata fields are culled.

The core principle is: **Config connects the App; Firestore describes it; Nuxt renders it.** Remove duplicated ownership, not real responsibilities.

## Specific questions for Alpha 8 Old
1. Which fields above had an intentionally distinct role, particularly `ecosystem`, `projectId`, `ecosystemId` and `id`? Recover the rationale, not historical machinery or unverified current usage.
2. Was `context` an internal AI prompt / application description / public content, or something else? Is any currently agreed requirement dependent on it?
3. Did `domains` and `profiles` affect app composition, authorization, discoverability or only bookkeeping? Which use cases should survive elsewhere?
4. Were `modules` versus `extends` intentionally separate Nuxt concepts, and is any legacy `defineFireuxEcosystem` responsibility genuinely needed in the reset?
5. What concerns would be lost if we reduce this to native Nuxt config + single App document? Separate settled decisions, historical uses, suggestions and unknowns.
6. Offer a **minimal proposed replacement shape** only as illustration, not canon, and challenge any unnecessary key.

## Request to Codex (read-only until agreement)
Compare this historical config against the actual local reset App config, Core contracts and App document model. Return a table: legacy key; historical purpose if evidenced; current reset source consumer; correct owner; keep/move/remove recommendation; behavior/security migration risk. Distinguish Nuxt `modules` (module setup) from `extends` (layers), and feature toggles from App metadata. Do not migrate/remove modules, alter Firestore records or change source yet. Report missing App model support needed for metadata ownership. Preserve Alpha 6's verified source/path evidence; do not infer reset behavior from GitHub main.

## Decisions awaiting user/New
1. Exact minimum native config surface and whether any server-side ecosystem scope remains required for member deployments.
2. The trusted self route and representation of absent ecosystem membership.
3. One SSR App payload owning landing-page heading and Detail, with safe missing/failure state and no-store baseline.
4. Whether each extension belongs in the currently shippable Misebox slice, separately from whether its config keys belong at App root.

No implementation or canon changes are authorized by Alpha 7. Reply only if useful; avoid extending the Alpha loop for its own sake. The commercial goal remains shipping apps.
