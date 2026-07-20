Public index family map
Updated: 2026-07-20
Ref: 4c0a1c7ad
Role: map, not canon
<!-- Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: require server-projected User joins for profile indexes. -->
<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: map fail-closed Kitchen/Place directory projection and bounded search behavior. -->

Purpose:
Map public index pages such as `/kitchens`, `/suppliers`, `/menus`, and similar browse surfaces.

Vertical links:
- Parent: pages.md
- Child: family-public-detail.md
- Child: family-menu.md

Horizontal links:
- components.md
- composables.md

Similar:
- Shows a public/runtime browse surface.
- Should not be a console.
- Should not be a dev probe.
- Should use domain collection components where possible.
- Should use domain CTA components such as `XCTA`, not generic CTA primitives in the page.
- Should keep route/meta shell light.

Known pattern:
- Root/global discovery pages may use core `PublicIndexSurface` for the shared hero,
  page rhythm, icon mark, and secondary domain doorway.
- Scoped and tenant indexes may keep the smaller `UPage`, `UPageHeader`, and
  `UPageBody` composition when the global discovery hero would be misleading.
- Root collection managers use core `CollectionDirectoryHeader` and
  `CollectionDirectoryState` for shared hierarchy and loading/empty treatment.
- Profile indexes for Chef, Driver, Agent, and Professional consume bounded
  public projections that join canonical User identity by profile uid. They do
  not list raw profile or User collections from the client.
- The Kitchen index consumes a cursor-bounded public projection that joins each
  page's explicit Place and canonical App scope in server batches. Kitchen
  cards do not require copied Place snapshots or per-row browser hydration.
- Kitchen projection rows require explicit publication, a public slug, and an
  existing explicitly referenced Place. Test, hidden, unlinked, and malformed
  rows fail closed. App overlays join only for a valid parent/tenant App scope.
- Kitchen directory filtering remains local only after the complete bounded
  result is loaded. While another cursor exists, the UI withholds local search
  rather than claim that an unloaded Kitchen does not exist.
- one domain CTA or intro component when useful, named `XCTA`
- one collection manager or equivalent list component
- dev debug only when actively needed

Lasagne rule:
- Repeat the page spine.
- Reuse the domain components.
- Keep data cooking below the page.
- Shared primitives may live inside domain components.
- Shared public-index presentation lives in `fireux-core`; domain managers keep
  fetching, cards, routes, actions, and copy in their owning package.
- App and Ecosystem are authority-sensitive exceptions: the page passes a
  named owner/platform controller to shared presentation. The manager never
  accepts a raw collection or chooses authority implicitly.
- Avoid generic config blobs in the page.

Differences:
- Console-capable entity indexes may link users toward console flows.
- Root menu index may include upload/tool behavior because quick menus can start without a kitchen.
- Some domain indexes are hidden from nav or app-specific.

CTA rule:
- Public index pages should render `XCTA`, not configure `EntityIndexCta` directly.
- `EntityIndexCta` may exist as an internal primitive inside `XCTA`.
- Domain logic and copy belong in `XCTA`, not in the page.

Open questions:
- Menu index is still evolving from quick-upload into a cleaner public browse/upload surface.
