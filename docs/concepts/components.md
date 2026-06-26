Components spine map
Updated: 2026-06-26
Ref: 2a3861666
Role: map, not canon

Purpose:
Map component folder and naming conventions.

Vertical links:
- Parent: nuxt-ui.md
- Child: family-console-entity.md
- Child: family-public-index.md
- Child: family-public-detail.md

Horizontal links:
- pages.md
- composables.md
- debug.md

Package components:
- Package UI belongs under `src/runtime/components`.
- App UI belongs under `app/components`.

Domain component folders:
- `X/Cards`
- `X/Collection`
- `X/Create`
- `X/Detail.vue`
- `X/Detail/Index.vue` when detail owns child slices
- `X/Edit`
- `X/Overview`
- `Console/X/*`

Detail rule:
- Use `X/Detail.vue` when the detail component is simple and self-contained.
- Use `X/Detail/Index.vue` when the detail surface owns child components.
- Put those child components inside `X/Detail/*` so the filesystem reads like the UI surface.

Root entity naming:
- Root entity component folders such as `Kitchen/**`, `Menu/**`, and `Supplier/**` are already public/root surfaces.
- Do not prefix components in those folders with `Public` unless it names an external imported concept.
- Use route/composable buckets such as `fireux/public/*` when “public” distinguishes runtime behavior rather than component location.

Console component folders:
- `Console/X/Index`
- `Console/X/Overview`
- `Console/X/Identity`
- `Console/X/Team`
- `Console/X/Operations`
- `Console/X/Sundries`

Console bucket rule:
- Every `components/Console/X` family should expose the same peer buckets: `Index`, `Overview`, `Identity`, `Team`, `Operations`, and optional `Sundries`.
- These buckets are directories. Prefer `Console/X/Overview/Index.vue` over `Console/X/Overview.vue`.
- `Team` is a shared console access concept, not an operation.
- `Operations` contains selected-target work such as kitchen dishes, menus, orders, recipes, or supplier catalogue items.
- `Sundries` quarantines parked or underdeveloped console surfaces so they do not pretend to be confirmed operations.
- Operation folders should default to an entry component, `Read.vue`, `Write.vue`, and optional `Detail.vue`.
- Use `Index.vue` only when the folder itself is intentionally the auto-imported component.
- `Create` belongs to root/public entity creation by default. In scoped operations, prefer `Write` unless a real UI workflow is named creation.
- Workflow subfolders under operations should be named after visible operator concepts, not technical storage buckets.

Working rules:
- Prefer named domain components over vague generic shells.
- Share functions/composables where behavior is common.
- Let child components own local presentation when it reduces parent script weight.
- Keep Nuxt UI as the default chrome layer.

Guard warnings:
- No `organisms` folders.
- No `Organisms*` component names.
- Relative imports in component source must resolve.

Open questions:
- Operator/claim/action panels need a clearer entity-family spine.
