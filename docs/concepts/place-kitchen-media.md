# Place and Kitchen media

Updated: 2026-08-18
Ref: e23268507
Role: map, not canon

## Ownership

Place is the physical venue and owns location photography: `image_url`,
`cover_image`, and `gallery_images`. Place may also own its venue identity
media through sparse `logo_image` and `wordmark_image` references when exact
approved artwork exists. Kitchen is the food operation at that Place and owns
sparse operational identity media in `assets.logo`, `assets.wordmark`, and the
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
media only when it is transparent identity artwork; otherwise it is a
photographic crop. Card components consume that typed role and do not guess
from file names, aspect ratios, colours, or individual records.

## Place identity colour

Place owns one optional validated six-digit `identity_color`. It is normally
sampled from the approved logo and is the one colour used to reconcile
transparent Place or Kitchen identity media with its backdrop. The editor may
label it **Primary colour**; the reviewed stored and DTO name is
`identity_color` so the field describes ownership rather than a generic page
theme.

Kitchen owns no identity-colour override. A bounded Place-backed Kitchen read
keeps the owners explicit—for example, `place.identity_color` beside Kitchen
identity/media—and consumers use the linked Place value. They do not copy the
colour onto Kitchen or flatten it into a second authority.

The colour may appear behind a transparent Place or Kitchen logo, either
wordmark, and transparent Kitchen card identity artwork. It never overlays or
tints Place image, cover, gallery, or other photographic media. Menu and App
palettes remain separate presentation owners.

Writers accept files and persist canonical Firebase Storage download URLs for
the exact entity-owned targets. The Place colour writer accepts only
`#rrggbb`.

The cross-owner target is one asset-role language through
`Place → Kitchen → App`: a role retains the same filename and relative path,
while only its entity prefix changes. Apps now prove that shape with
`apps/<appId>/img/app/<filename>` and the matching bundled
`public/img/app/<filename>`. Existing Place and Kitchen Storage targets predate
that convention. They remain readable compatibility paths until an explicit
guarded Storage migration moves the objects and updates their recorded URLs;
new presentation code must not treat those legacy paths as a second permanent
asset system.

The bounded Misebox migration from the retired Place `assets` object to these
canonical sparse Place fields is owned by
`scripts/migrate-misebox-place-assets.mjs`. It verifies every referenced
Storage object, preserves complete protected pre-images, and promotes exact
Place logo and wordmark references into their canonical sparse Place fields.
The one-time guarded recovery at
`scripts/restore-misebox-place-identity.mjs` restores exact approved identity
references from that protected pre-image when an earlier migration plan
classified them as unsupported.

The protected Interlaken Pizza enrichment at
`scripts/migrate-interlaken-pizza-profile.mjs` is a one-Place application of
the same boundary. It verifies owner-controlled website media before copying
it into exact Place-owned Storage targets, reads current hours for the exact
Google Place ID without storing Google photo content, preserves a complete
pre-image, and updates the canonical Place only through the MCP/Skill mutation
lane.

## Compatibility and migration

Current source still stores Place `media_backdrop_color` and may store Kitchen
`assets.backdrop_color`. Both are migration input for the one Place-owned
`identity_color`; new work must not add another Kitchen override. The guarded
migration must update Place reads, writes, public projections, Kitchen joins,
fixtures, guards, and stored data together, then remove the Kitchen field when
its effective Place colour has been verified.

The pre-release `image_shade` values remain read-only compatibility input:
`light` resolves to `#111827`, `dark` to `#ffffff`, and `none` to unset. Run
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
