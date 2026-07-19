Public detail family map
Updated: 2026-07-19
Ref: 565ebd668
Role: map, not canon

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
- Uses an endpoint-first public projection for the initial SSR render. A
  client-only Firestore binding may enrich an already-rendered public object,
  but it must not be the authority for initial content or missing/error state.
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
