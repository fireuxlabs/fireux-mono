# Place and Kitchen media

Updated: 2026-08-30
Ref: f3c707663
Role: map, not canon

## Ownership

Place is the physical venue and owns its complete shared venue identity:
`name`, story, location, `image_url`, `cover_image`, `gallery_images`,
`logo_image`, `wordmark_image`, and its identity colour. Kitchen is the food
operation at that Place. Its document id equals the Place id, so Kitchen owns
no second identity or media object and stores no redundant `place_id`.
The canonical Kitchen root is the domain-only `id`, `slug`, `status`, and
`visibility` shape. Place owns the shared name; Kitchen readers join it from
`places/{kitchenId}` and new Kitchen writers do not persist a duplicate name.

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

Place owns one optional validated six-digit `media_backdrop_color`. It is
normally sampled from the approved logo and is the one colour used behind
transparent Place or Kitchen identity media. The field is not a page theme or
general entity accent.

Kitchen owns no backdrop-colour override. A bounded Place-backed Kitchen read
keeps the owners explicit—for example, `place.media_backdrop_color` beside
Kitchen identity/media—and consumers use the linked Place value. They do not
copy the colour onto Kitchen or flatten it into a second authority. A Kitchen
without a same-id Place has no presentation colour.

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
The completed `scripts/migrate-misebox-place-taglines.mjs` cutover renamed the
Place presentation field from `brand_tagline` to `tagline` without inventing
missing Place copy.
`scripts/reconcile-misebox-place-provider-fields.mjs` is the protected,
hash-confirmed named-database lane for additive Google provider reconciliation.
It requests no photos, preserves all non-empty values, records provider
conflicts as drift, and verifies the exact post-write document shape.
The completed Misebox hard cutover at
`scripts/migrate-misebox-kitchen-place-identity-cutover.mjs` first promotes
missing legacy Kitchen identity, media, palette, and same-id Place evidence,
then removes Kitchen `name`, `place_id`, `identity`, `assets`, and
`brand_palette`. It requires the retained managed export, a hash-confirmed
plan, a protected local preimage, and exact post-write verification; it never
deletes Storage objects.
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

Place onboarding now collects the discovery fields needed by the shared Place
and Kitchen collection surfaces: factual `about` copy, bounded discovery
`tags`, and an optional Place-owned cover image. AI may propose copy and tags
from confirmed provider and owner evidence; the operator reviews them before
the trusted onboarding command persists the Place. The protected live proof at
`scripts/backfill-la-tapberne-discovery.mjs` applies the same fields using La
Tapberne's owner-controlled tenant copy and photo. The completed exact-shell
cleanup at `scripts/delete-misebox-junk-kitchen-shells.mjs` retains protected
preimages and repairs AppUser Kitchen references before removing its four
verified non-operational Kitchen/Place pairs.

## Migration

The canonical Place field is `media_backdrop_color`. Kitchen `name`, `identity`,
`assets`, `brand_palette`, and `place_id` are rejected root fields. Misebox live
storage has completed their guarded removal after every Kitchen received a
same-id Place retaining the required identity and media.

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
