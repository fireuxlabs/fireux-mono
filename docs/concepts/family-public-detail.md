Public detail family map
Updated: 2026-07-21
Ref: 5b6cfcc8e
Role: map, not canon

<!-- Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: join canonical User identity by profile uid. -->
<!-- Concurrent edit — 2026-07-20 20:12 CEST — Repo Efficiency Pass 2 of 6: map the shared SSR profile-detail projection. -->
<!-- Concurrent edit — 2026-07-21 13:09 CEST — Public Jobs projection: map exact SSR Job detail with server-only source scope. -->

Purpose:
Map public detail pages such as `/kitchens/[slug]`, `/suppliers/[slug]`, `/menus/[menuId]`, and similar surfaces.

Vertical links:

- Parent: pages.md
- Child: family-menu.md

Horizontal links:

- components.md
- composables.md
- debug.md

Emerging shared order:

- Header.
- Profile or identity card.
- Main public content.
- Operator/actions surface when relevant.
- Dev debug.

Similar:

- Resolves one public object or public projection.
- Profile details keep the root profile domain-only and resolve canonical User
  presentation separately by the same uid.
- Uses an endpoint-first public projection for the initial SSR render. A
  client-only Firestore binding may enrich an already-rendered public object,
  but it must not be the authority for initial content or missing/error state.
- Agent, Chef, and Professional use the shared `usePublicProfileDetail`
  transport with domain-owned projected payload types. Their raw Firestore
  roots remain owner-only and are not a guest detail transport.
- Job detail exact-loads `/api/public/jobs/:id` during SSR through the same
  eligibility and field allowlist as the public Job index. Public Job pages do
  not receive source App scope or raw-read Company, Place, owner, or stamp data,
  and contain no edit/status mutation controls.
- Returns truthful outer HTTP status for missing and failed server reads; a
  client-side recovery path must not turn a direct 404 or 5xx into HTTP 200.
- Shows useful public content first.
- Keeps operator/private actions separate from main public content.
- Uses named domain components.

Different:

- Kitchen detail can show public menus.
- Supplier detail should use slug and company-style identity.
- Portfolio detail is likely private-light and public-light.
- Menu detail can be a photo/PDF quick menu or a structured kitchen menu.

Open questions:

- Exact operator/action panel spine is not fully settled.
- Detail pages should be aligned opportunistically when touched, not in a massive sweep.
- Route identity still needs a dedicated pass: choose `id`, `slug`, or both per
  entity family by comparing siblings before changing routes.

Route identity to-confirm:

- Kitchen: public detail currently uses slug.
- Menu: public detail currently uses menu id/slug-like key; root quick menus and
  kitchen menus are still being reconciled.
- Supplier: should likely use slug for public company-style identity, but confirm
  against existing data and console needs.
- Project has no public detail route; it remains a private FireUX control-plane
  entity.
- Portfolio and Property: private-light/public-light identity needs confirmation
  before moving from id to slug or both.
