# Place and Kitchen media

Updated: 2026-08-10
Ref: d232cc731
Role: map, not canon

## Ownership

Place is the physical venue and owns its base identity and location media:
`assets.image`, `assets.cover`, `assets.gallery`, `assets.logo`, and
`assets.wordmark`.
Kitchen is the food operation at that Place and
may own sparse identity overrides only when its operational identity genuinely
differs from the Place base.

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

`Place.assets.backdrop_color` is an optional validated six-digit hex base for
transparent brand media used by Place-backed children. A Kitchen persists
`identity.media_backdrop_color` only when it needs a different colour.
Resolution is Kitchen override, then Place base, then unset.

The resolved colour may appear behind a transparent Kitchen logo, either
Kitchen wordmark, and a Kitchen card override when that file is transparent.
It never overlays or tints Place image, cover, gallery, or other photographic
media.

Writers accept files and persist canonical Firebase Storage download URLs for
the exact entity-owned targets. Colour writers accept only `#rrggbb`.
`place-assets.model.ts` owns the Place asset labels, Storage paths, and
optimized source dimensions shown by the operator asset library. App runtime
asset requirements remain a separate App-owned family.

## Asset roles

Firestore and Storage use the same role vocabulary. The canonical targets are
`places/{placeId}/image`, `/cover`, `/gallery/{imageId}`, `/logo`, and
`/wordmark`; no version suffix or identity sub-tree changes those meanings.
Bounded DTOs preserve the same `assets` object so consumers do not translate a
second Place media schema. `assets.backdrop_color` has no Storage object.

## Verification

Start with the canonical Place/Kitchen models, `place-spine.ts`,
`kitchen-spine.ts`, trusted media mutation boundaries, public/Console
projectors, and `scripts/guards/entity-authority.mjs`. Verify the focused
package typechecks/builds and visually inspect logo, both wordmarks, card
override, inherited Place fallback, and photographic Place media.
