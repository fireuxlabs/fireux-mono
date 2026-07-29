# Place and Kitchen media

Status: canonical family contract

## Ownership

Place is the physical venue and owns location photography: `image_url`,
`cover_image`, and `gallery_images`. Kitchen is the food operation at that
Place and owns `identity.logo_image_url`, `identity.wordmark_image_url`,
`identity.wordmark_no_logo_image_url`, and the optional
`identity.card_image_url`.

Kitchen cards resolve the Kitchen card override, then Place cover, then Place
image. They never copy Place media into Kitchen.

## Transparent-media backdrop

`Place.media_backdrop_color` is an optional validated six-digit hex base for
transparent brand media used by Place-backed children. A Kitchen persists
`identity.media_backdrop_color` only when it needs a different colour.
Resolution is Kitchen override, then Place base, then unset.

The resolved colour may appear behind a transparent Kitchen logo, either
Kitchen wordmark, and a Kitchen card override when that file is transparent.
It never overlays or tints Place image, cover, gallery, or other photographic
media.

Writers accept files and persist canonical Firebase Storage download URLs for
the exact entity-owned targets. Colour writers accept only `#rrggbb`.

## Compatibility and migration

The pre-release `image_shade` values remain read-only compatibility input:
`light` resolves to `#111827`, `dark` to `#ffffff`, and `none` to unset. New
writes use only `media_backdrop_color`. Run
`scripts/audit-place-kitchen-media-backdrops.mjs` to produce the bounded Live
checklist. Asset-specific review annotations live in
`scripts/data/misebox-media-backdrop-audit.json`; they may mark an opaque asset
as requiring no backdrop or defer colour authority until a temporary asset is
replaced. Any migration is a separate, explicitly approved production write;
after all records are migrated, remove the compatibility decoder and legacy
consumer types.

## Verification

Start with the canonical Place/Kitchen models, `place-spine.ts`,
`kitchen-spine.ts`, trusted media mutation boundaries, public/Console
projectors, and `scripts/guards/entity-authority.mjs`. Verify the focused
package typechecks/builds and visually inspect logo, both wordmarks, card
override, inherited Place fallback, and photographic Place media.
