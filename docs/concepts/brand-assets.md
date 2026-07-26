# Brand asset authority map

Updated: 2026-07-26
Ref: current source
Role: map, not canon

## Purpose

Map the single FireUX platform identity source, its deterministic projections,
and the boundary that lets genuinely branded Apps own a different identity.

## Vertical links

- Parent: `fireux-mono.md`
- Family registry: `spine.md`

## Horizontal links

- `app-config.md`
- `components.md`

## Current source

- Core source family:
  `packages/core/fireux-core/src/runtime/public/img/core/brand`
- Runtime fallback resolver:
  `packages/core/fireux-core/src/utils/brandAssets.ts`
- Shared asset catalogue and surface previews:
  `packages/core/fireux-core/src/runtime/pages/assets.vue`
- SVG/raster render declaration and manifest:
  `scripts/_lib/fireux-brand-render.mjs`
- Read-only render check and explicit renderer:
  `scripts/render-fireux-brand-assets.mjs`
- Projection declaration:
  `scripts/_lib/fireux-brand-assets.mjs`
- Read-only check and explicit writer:
  `scripts/sync-fireux-brand-assets.mjs`
- Executable guard:
  `scripts/guards/fireux-brand-assets.mjs`
- BuenoHost ecosystem source family:
  `packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/brand`
- BuenoHost render/projection declaration:
  `scripts/_lib/buenohost-brand-render.mjs` and
  `scripts/_lib/buenohost-brand-assets.mjs`
- BuenoHost renderer and guard:
  `scripts/render-buenohost-brand-assets.mjs` and
  `scripts/guards/buenohost-brand-assets.mjs`

## Authority contract

FireUX Core owns the default FireUX platform mark, light and dark wordmarks,
app icon, PWA icons, favicon, thumbnail, and social cover. The
`fireux-fireux` ecosystem and the FireUX parent App consume byte-identical
projections of that family; they do not maintain independent copies.

The nearest working sibling is the FireUX parent App itself. Its
`public/img/app` paths remain the runtime contract, while Core is the authored
source. The projection script bridges those two requirements without creating
a second design authority.

Light and dark name the intended surface:

- `wordmark-light` is used on a light surface and carries the dark `Fire` text.
- `wordmark-dark` is used on a dark surface and carries the light `Fire` text.

The primary identity is the flowing FireUX flame: four separate ember, amber,
yellow, and hot-core regions form one rising mark, while the space between
them inherits the surface beneath. The palette is ember `#FF4F00` to
`#FF6900`, amber `#FF9500` to `#F5A500`, yellow `#FFB800` to `#FFD21F`, hot
core `#FFF3A6` to `#FFF085`, theme yellow `#EAB308`, and ink `#0B111C`.
Wordmark masters retain tight visible bounds and transparent raster padding
so centred consumers centre clean artwork rather than a padded or opaque
canvas. Change the SVG masters only in the Core source family, then run:

```sh
node scripts/render-fireux-brand-assets.mjs --write
```

That command renders the canonical PNG, PWA, 1200-by-630 thumbnail, and
favicon family, records source/output hashes and dimensions, then updates the
projections. Running it without `--write` is a read-only drift check. Use
`scripts/sync-fireux-brand-assets.mjs --write` only when the canonical outputs
are current and a projection alone needs restoring.

## App boundary

Project `/img/app` remains the public asset contract for every App. A
genuinely branded child App may own its own complete asset family and is not a
FireUX projection target. Core fallback assets still provide the FireUX
platform identity when an App-specific value is unavailable.

The shared `/assets` catalogue always presents the conventional family above.
An App may append a small, source-controlled product asset family through
`app.config.ts` at `fireuxAssets.catalogue`; those entries must still resolve
under the App-owned `/img/app` contract. This keeps product-specific marks
visible without copying or replacing the Core catalogue page.

Do not add a new FireUX logo copy to a child, ecosystem, component, or project
and edit it independently. Either add it to the guarded projection declaration
because it is FireUX identity, or keep it as an explicit product-brand
override.

## Ecosystem-owned identity

BuenoHost is an ecosystem-owned identity rather than a FireUX platform
projection. Its SVG masters live in the BuenoHost ecosystem package, and its
global App paths are deterministic projections of that source. The house mark,
light/dark wordmarks, full-bleed app icon, PWA icons, favicon, thumbnail, and
cover are rendered and checked with:

```sh
node scripts/render-buenohost-brand-assets.mjs --write
```

Running the command without `--write` is the read-only drift check. Branded
tenant Apps such as Book with Nats remain outside the projection list and keep
their own complete identity.

## Delta register

| Difference                                           | State      | Reason or alignment trigger                                                                |
| ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Branded child Apps own different marks and wordmarks | `accepted` | Product identity is an App-level presentation delta                                        |
| FireUX ecosystem PNG paths mirror Core assets        | `accepted` | Existing runtime consumers require ecosystem-local public paths; the projection is guarded |
| FireUX parent App paths mirror Core assets           | `accepted` | The App media contract requires `/img/app`; the projection is guarded                      |
| An unguarded duplicate of FireUX platform identity   | `drift`    | Add a projection target or consume the Core fallback directly                              |
| Light and dark wordmarks carry the same text colour  | `drift`    | Surface semantics must remain visible and distinct                                         |

## Verification and maintenance

Run the render check and `pnpm guard` after changing the source family or its
consumers. Update this map, the repo-wide GPT context, and the
render/projection declarations together when the ownership boundary or
required asset family changes. Do not record temporary campaigns, preview
state, or generated design discussion here.
