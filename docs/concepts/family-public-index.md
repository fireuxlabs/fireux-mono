Public index family map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

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
- Should keep route/meta shell light.

Known pattern:
- `UPage`
- `UPageHeader`
- `UPageBody`
- one CTA or intro component when useful
- one collection manager or equivalent list component
- dev debug only when actively needed

Differences:
- Console-capable entity indexes may link users toward console flows.
- Root menu index may include upload/tool behavior because quick menus can start without a kitchen.
- Some domain indexes are hidden from nav or app-specific.

Open questions:
- Exact CTA naming and behavior still needs final alignment across all public indexes.
- Menu index is still evolving from quick-upload into a cleaner public browse/upload surface.
