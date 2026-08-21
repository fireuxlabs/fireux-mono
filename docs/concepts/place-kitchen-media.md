# Place and Kitchen media

Updated: 2026-08-21
Ref: f3c707663
Role: map, not canon

## Ownership

Place is the physical venue and owns its complete shared venue identity:
`name`, story, location, `image_url`, `cover_image`, `gallery_images`,
`logo_image`, `wordmark_image`, and its identity colour. Kitchen is the food
operation at that Place. Its document id equals the Place id, so Kitchen owns
no second identity or media object and stores no redundant `place_id`.

Kitchen cards and detail pages join the canonical Kitchen with that same-id
Place. They present Place identity without copying or overriding it on
Kitchen.

Workspace Kitchen targets use the linked Place identity. Demo fixtures create
the same canonical Kitchen plus same-id Place pair.

The bounded Kitchen directory projection declares the selected Place asset as
`image_kind: photograph | brand`. Place cover and Place image are photographic;
transparent Place identity artwork is brand media. Card components consume
that typed role and do not guess from file names, aspect ratios, colours, or
individual records.

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

The colour may appear behind a transparent Place logo or wordmark when that
Place is presented as a Kitchen. It never overlays or tints Place image, cover,
gallery, or other photographic media. Kitchen Workspace theme, Menu theme, and
App theme remain separate presentation owners.

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

## Migration

Current Place source still names its colour `media_backdrop_color`; its
separate Place migration owns the rename to `identity_color`. Kitchen
`identity`, `assets`, `brand_palette`, and `place_id` are rejected root fields.
The guarded Entity migration removes them only after the same-id Place retains
the required identity and media.

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
`kitchen-readers.ts`, trusted media mutation boundaries, public/Workspace
projectors, and `scripts/guards/entity-authority.mjs`. Verify the focused
package typechecks/builds and visually inspect logo, both wordmarks, card
override, inherited Place fallback, and photographic Place media.
