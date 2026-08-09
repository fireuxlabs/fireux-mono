# Apps That Slap ecosystem map

Updated: 2026-08-09
Ref: 90f82847e
Role: map, not canon

## Purpose

Map the ecosystem boundary that keeps independent, experience-led Apps out of
the FireUX Core ownership bucket while preserving genuine domain ownership.

## Links

- Parent: `fireux-mono.md`
- Family registry: `spine.md`
- Scoped context: `../ai/apps-that-slap-context.md`
- Runtime package: `runtime-package.md`
- App configuration: `app-config.md`
- Brand assets: `brand-assets.md`
- Product language: `product-language.md`

## Family and nearest sibling

- Family: ecosystem identity/config runtime packages under
  `packages/ecosystem/fireux-*`.
- Nearest healthy structural sibling: `fireux-misebox` using Core
  `configureFireuxEcosystemModule`.
- Must match: one stable ecosystem package, automatic App-config loading,
  explicit Firebase binding, package exports, runtime public asset directory,
  project registry authority, standard App asset contract, and guard coverage.
- May differ: admission policy, ecosystem product language, App-owned visual
  composition, and explicitly exported presentation contracts.

## Admission and routing test

Classify from current product source, not folder history:

1. Name the App's primary product experience.
2. Name its operational objects, workflows, and data authority.
3. If a genuine domain ecosystem owns those operations, keep the App there.
4. If the independent branded/digital experience is itself the product and no
   genuine domain owns it, Apps That Slap is eligible.
5. If evidence is incomplete, leave ownership unchanged and classify the App
   as a candidate outside durable context.

Apps That Slap is not an “anything homeless” bucket. FireUX Core remains the
owner of generic infrastructure and primitives, never miscellaneous Apps.

The stable technical key remains `slap` across package identity, project
routing, Firebase, and database selection. “Apps That Slap” is the ecosystem
name. Expanding the name does not justify a duplicate package, key, Firebase
project, database, or project tree.

## Reusable presentation boundary

`fireux-slap/runtime/presentation/apps-that-slap` exports a presentation-only
contract with the grammar:

`Page -> Scenes -> optional Background / required Content / optional Foreground -> Elements`

A domain App may import that subpath while retaining its existing ecosystem
and domain dependencies. The seam carries structure only: no automatic module
registration, ownership inference, domain data, routing, Firebase, storage,
motion, or visual implementation. App-local scenes remain composed and styled
by the App; reusable transition infrastructure belongs in its coordinated Core
seam.

## Current source and guards

- `packages/ecosystem/fireux-slap/src/module.ts`
- `packages/ecosystem/fireux-slap/src/config/firebase/ecosystem.config.ts`
- `packages/ecosystem/fireux-slap/src/config/module/runtime-config.ts`
- `packages/ecosystem/fireux-slap/src/runtime/presentation/apps-that-slap.ts`
- `scripts/_lib/app-registry.mjs`
- `scripts/guards/ecosystem.mjs`
- `scripts/guards/projects.mjs`
- `scripts/guards/product-landing.mjs`
- App `nuxt.config.ts`, `package.json`, `firebase.json`, and `public/img/app/*`

## Delta register

| Difference | State | Reason or alignment trigger |
| --- | --- | --- |
| Stable key is `slap` while the ecosystem name is Apps That Slap | `accepted` | Existing package, Firebase, database, and project routing use the stable key; a display-name expansion does not warrant infrastructure churn |
| Domain Apps may consume the presentation contract | `accepted` | Presentation vocabulary is independent of operational ownership; imports never reclassify the App |
| Existing Apps under `projects/slap` predate the admission rule | `to-confirm` | Audit each App from current source before retaining or changing its classification |
| Existing optional commerce-language defaults remain available | `accepted` | They support current Apps but do not define ecosystem admission or become a capability every member must use |
| Slap Main App contains older lifestyle-commerce language | `migration` | Align parent literature bottom-up in its landing-owned task without redefining ecosystem admission from legacy copy |
| Motion and GSAP are absent from the ecosystem contract | `accepted` | Shared transition infrastructure is coordinated through Core; this seam is semantic structure only |

## Verification and maintenance

Build/type-check `fireux-slap`, run the ecosystem and relevant project/landing
guards, then run `pnpm guard`. Update this map when the family relationship,
admission test, stable key, or presentation boundary changes. Keep candidate
App lists and temporary migration status in implementation reports, not here.
