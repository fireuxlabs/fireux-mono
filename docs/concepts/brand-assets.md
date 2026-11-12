# Brand asset authority map

Updated: 2026-11-07
Ref: 614700fd9
Role: map, not canon

## Purpose

Map App artwork ownership, local delivery, stored media, and User avatars.

## Related maps

- Parent: `fireux-mono.md`
- Family: `spine.md`
- Configuration: `app-config.md`
- Composition: `components.md`
- Designer handoff: `../assets.md`

## Current source

- Core source family:
  `packages/core/fireux-core/src/runtime/public/img/core/brand`
- BuenoHost source family:
  `packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/brand`
- Local paths and fallback resolver:
  `packages/core/fireux-core/src/utils/brandAssets.ts`
- Asset catalogue:
  `packages/core/fireux-core/src/runtime/pages/assets.vue`, with App-owned
  presentation under `runtime/app/components/Assets` and the catalogue in
  `runtime/app/models/asset-catalogue.ts`
- App logo and wordmark renderers:
  `packages/core/fireux-core/src/runtime/app/components/Brand/Logo.vue` and
  `packages/core/fireux-core/src/runtime/app/components/Brand/Wordmark.vue`
- App profile and collection media consumers:
  `packages/core/fireux-core/src/runtime/app/components/Detail/Index.vue` and
  `packages/extensions/fireux-ecosystem/src/runtime/components/landing/AppCollection.vue`
- App role paths, dimensions and stored field names:
  `packages/core/fireux-core/src/runtime/app/models/app-media-requirements.ts`
- App media editor and trusted sync command:
  `packages/core/fireux-core/src/runtime/app/components/Edit/Media.vue` and
  `packages/core/fireux-core/src/runtime/app/server/media/sync.ts`
- User avatar command:
  `packages/core/fireux-core/src/runtime/user/server/avatar/update.ts`

## Artwork authority

Every App exposes the standard `/img/app/*` family. Nuxt configuration does not
declare artwork ownership or approval state. Core and ecosystem source families
retain their design authority; branded Apps own their artwork. Never borrow
another App's export to fill a missing asset.

The [asset brief](../assets.md) lists the eight required runtime exports. Their
executable constraints remain in `app-media-requirements.ts`. Retain original
masters outside `public`, such as an App-owned `brand` directory. Correcting an
export's size or surface colour preserves its approved geometry and wording;
it does not authorize a replacement identity.

The runtime wordmark roles are raster: `wordmark-light.png` and
`wordmark-dark.png`. Additional SVG wordmarks must preserve approved geometry
as outlined paths or come from a reviewed vector master. Do not rebuild an
approved raster with `<text>`, a substitute font, or an approximate trace.
Until a faithful vector exists, use the approved PNG.

Core owns the default FireUX mark, wordmarks, app icon, PWA icons, favicon,
thumbnail, and cover. The FireUX ecosystem and parent App share that design
authority; their exports must not become independently edited brands. The
parent App's `public/img/app` remains its runtime contract.

The former FireUX and BuenoHost rendering/projection scripts and guards were
removed. There is no supported automated projection command; retained render
manifests do not prove current files match. Compare source and exports when
editing artwork.

## Enforcement

Core's `runtime/app/server/onboarding/brand-assets.ts` owns the file inspector
and assertion, using the canonical App media requirements. It verifies all eight
files, actual formats, complete image decoding, dimensions, equal wordmark
canvases and PNG-encoded ICO frames at 16, 32, 48 and 64 pixels. ICO directory
dimensions and byte ranges must match the embedded images.

- `pnpm check:assets` audits every `projects/*/*` Nuxt App, including the starter;
  add an App directory to check one. CI runs it after dependency installation.
- Core's native `build:before` hook rejects invalid production App assets.
  Development remains available for editing, and independent Core consumers do
  not acquire an App asset obligation.
- `tools/firebase-release/output.mjs` checks the packaged `.output/public`
  family before release. Both generic and Misebox release flows use this gate.
- `src/test/app-brand-assets.test.mjs` covers the validator and build hook;
  IDE tooling and release tests cover discovery and packaged-file rejection.

These checks do not approve an identity, prove faithful letterforms or certify
contrast. Review actual light/dark previews and the named master for those.

## Surface variants

Light and dark name the intended surface:

- `wordmark-light` is for a light surface and carries dark Fire text.
- `wordmark-dark` is for a dark surface and carries light Fire text.

The primary identity is the flowing FireUX flame: four separate ember, amber,
yellow, and hot-core regions form one rising mark, while the space between
them inherits the surface beneath. The palette is ember `#FF4F00` to
`#FF6900`, amber `#FF9500` to `#F5A500`, yellow `#FFB800` to `#FFD21F`, hot
core `#FFF3A6` to `#FFF085`, theme yellow `#EAB308`, and ink `#0B111C`.
Wordmark masters retain tight visible bounds and transparent raster padding
so centred consumers centre clean artwork rather than a padded or opaque
canvas. Change FireUX SVG masters only in the Core source family and keep
their App/ecosystem exports faithful to those masters.

## App delivery and sync

The deployed App uses bundled artwork through the immutable `GLOBAL_BRAND_ASSETS`
export in `src/utils/brandAssets.ts` and App Brand components. Static paths are
ordinary data; browser asset checks remain reactive composables. The required
local-assets check is `app/composables/brand/useRequiredBrandAssetsStatus.ts`.
Image components own actual load-failure fallback; the retired tenant placeholder
flag could not infer fallback from fixed App paths. Cross-App cards
use recorded `App.media` URLs through `useAppView`;
another App's local bundle is not their source. Core fallback artwork supplies
runtime resilience; it does not satisfy an App's authoring contract.

`AppEditDev` composes `AppEditMedia`. Individual-image Sync, bulk sync and App
initialization call the same `syncAppMediaToStorage` adapter and trusted server
command. It requires development/developer authority, accepts known image
kinds, and derives App and Storage bucket from runtime config. It validates
local image dimensions and records uploaded URLs under `App.media`. Missing
owner artwork fails; there is no implicit parent-App fallback.

Storage objects use `apps/{appId}/img/app/*`; favicon and PWA files stay local.
A recorded URL does not prove that Storage matches the current source file.
The `/assets` library groups the standard family into Brand, App images, and
Browser and install. It previews the exact file without brand fallback, reports
image-load failures and observed dimensions, and provides original-file and
download links. Preview background controls affect only the artwork frame.
Requirements come from the canonical App media model; a decoded preview is not
proof of byte validation, publication or Storage sync. An App may append its own
product assets through `app.config.ts` at `fireuxAssets.catalogue`, under its
`/img/app` contract.

## Photographic media

Photographs and brand artwork have distinct delivery contracts. Core's
`runtime/server/utils/uploads/photo-image.ts` owns `normalizePhotoImage` for
explicit domain photo uploads: validate JPEG/PNG/WebP, apply orientation, remove
only fully transparent outer borders, preserve natural proportions, and encode
WebP within 1200 pixels without enlargement. Opaque borders and faint alpha
content remain intact. Do not bake square canvases or presentation padding into
new photo files. Domains retain upload authority, immutable Storage publication,
record attachment and cleanup; this helper neither acquires authority nor writes.

`runtime/utils/photo-image-url.ts` supplies `photoImageUrl` for remote photo
display. It selects `/api/proxy/image?url=…&variant=photo`; local asset paths stay
local. The Core proxy reuses the bounded public-raster network policy and derives
normalized bytes without modifying historical files, URLs, tokens or records.
Two jobs run concurrently, with up to 32 waiting for at most 30 seconds; delivery
reserves capacity before fetching so ordinary gallery bursts do not exhaust the
upstream fetch slots. Core's `server/utils/http/photo-delivery-cache.ts` coalesces
in-flight requests and retains derived bytes per server instance for five minutes,
bounded by 128 entries and 64 MiB with least-recently-used eviction. Keys include
the transform contract and exact source URL, including query and token differences;
failures are never cached. At most 34 distinct deliveries can be pending. Browser
HTTP caching remains available; domains add no canvas or image-byte cache.
Square thumbnails use the normalized photo with native `object-fit: cover`;
uncropped views may use `contain`. Existing opaque letterboxing is content and
is not guessed away. Logos, wordmarks, avatars and ordinary proxy requests do
not opt into this photographic transform implicitly.

Verify byte geometry, orientation, alpha preservation and grid bursts with
`packages/core/fireux-core/src/test/server/uploads/photo-image.test.mjs`, plus
`packages/core/fireux-core/src/test/server/http/photo-delivery-cache.test.mjs`, and
the existing proxy network-policy and protected-upload tests. A consuming screen
still needs visual review; these tests do not establish live image appearance.

## Ecosystem identity

BuenoHost's SVG masters live in its ecosystem package; global App exports
share that source authority. Preserve the house mark, light/dark wordmarks,
full-bleed app icon, PWA icons, favicon, thumbnail, and cover when updating
exports. Branded tenant Apps such as Book with Nats own a separate complete
identity.

## User and AppUser

User owns its avatar; AppUser membership does not duplicate it. Member lists
hydrate the canonical User. The ecosystem avatar is the local default.
Onboarding establishes User identity before an optional upload; profile edits
use the same authenticated avatar command. It validates image bytes, uploads a
unique object, attaches its URL to User, and attempts cleanup of a failed
attachment or the previous owned upload. Cleanup failure is logged; it does
not undo a saved avatar or imply that background retries exist.

## Differences

| Difference                                               | State     | Rule                                                          |
| -------------------------------------------------------- | --------- | ------------------------------------------------------------- |
| Branded Apps use different artwork                       | accepted  | Product identity belongs to the App                           |
| Approved PNG has no faithful SVG master                  | accepted  | Keep the PNG; do not invent replacement geometry              |
| Core artwork is exported into App/ecosystem public paths | accepted  | Preserve its source identity and compare exports when editing |
| An export is edited as an independent FireUX brand       | drift     | Restore source authority or declare a genuine product brand   |
| Light/dark variants lose their surface semantics         | drift     | Restore the intended visible contrast                         |
| Artwork is awaiting approval                             | migration | Track it in product/design work, not runtime configuration    |

## Verification and maintenance

For App sync behavior, use
`packages/core/fireux-core/src/test/app-media-sync.test.mjs`; for User avatar
behavior, use `packages/core/fireux-core/src/test/user-profile-commands.test.mjs`.
These tests do not verify deployed Storage contents or artwork fidelity. Check
changed image dimensions and actual local/remote presentation when artwork
changes, and compare exports with their owning source. No retired renderer or
`pnpm guard` step is required. Update this map when ownership or required asset
roles change; keep temporary campaigns and design discussion outside it.
