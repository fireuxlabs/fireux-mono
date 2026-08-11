# Place and Kitchen media

Updated: 2026-08-04
Ref: d232cc731
Role: map, not canon

## Ownership

Place is the physical venue and owns location photography: `image_url`,
`cover_image`, and `gallery_images`. Place may also own its venue identity
media through sparse `logo_image` and `wordmark_image` references when exact
approved artwork exists. Kitchen is the food operation at that Place and owns
sparse operational overrides in `assets.logo`, `assets.wordmark`, and the
optional `assets.image` card override. Place media is never copied into those
Kitchen fields.

Kitchen cards resolve the Kitchen card override, then Place cover, then Place
image. They never copy Place media into Kitchen.

Console Kitchen targets are identity controls rather than public cards. They
use only the Kitchen-owned logo, with a neutral Kitchen fallback when no logo
exists; Place photography is never substituted as Console identity. Demo
fixtures enforce the same ownership split.

The bounded Kitchen directory projection declares the selected asset as
`image_kind: photograph | brand`. Place cover and Place image remain
photographic and render with cover treatment. A Kitchen card override is brand
media only when it carries the resolved transparent-media backdrop; otherwise
it is a photographic crop. Card components consume that typed role and do not
guess from file names, aspect ratios, colours, or individual records.

## Transparent-media backdrop

`Place.media_backdrop_color` is an optional validated six-digit hex base for
transparent brand media used by Place-backed children. A Kitchen persists
`assets.backdrop_color` only when it needs a different colour.
Resolution is Kitchen override, then Place base, then unset.

The resolved colour may appear behind a transparent Kitchen logo, either
Kitchen wordmark, and a Kitchen card override when that file is transparent.
It never overlays or tints Place image, cover, gallery, or other photographic
media.

Writers accept files and persist canonical Firebase Storage download URLs for
the exact entity-owned targets. Colour writers accept only `#rrggbb`.

The bounded Misebox migration from the retired Place `assets` object to these
canonical sparse Place fields is owned by
`scripts/migrate-misebox-place-assets.mjs`. It verifies every referenced
Storage object, preserves complete protected pre-images, and promotes exact
Place logo and wordmark references into their canonical sparse Place fields.
The one-time guarded recovery at
`scripts/restore-misebox-place-identity.mjs` restores exact approved identity
references from that protected pre-image when an earlier migration plan
classified them as unsupported.

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
