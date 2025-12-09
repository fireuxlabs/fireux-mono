# Layouts: usage and authoring

Purpose: keep layout naming consistent and avoid app-local overrides. Layouts live in `packages/core/fireux-core/src/runtime/layouts/`.

## Use existing layouts
- Reference by name (file stem), e.g. `layout: 'dashboard'`, `layout: 'auth'`, `layout: 'docs'`.
- Do not copy layouts into apps/tenants; rely on the core exports.
- If you must wrap/override for an ecosystem, do it in the ecosystem package and keep the name unique.

## Authoring rules (core layouts)
- `defineOptions({ name: '<file-stem>' })` — no `Core` prefix; name must match the filename.
- Render pages with `<NuxtPage />`, not `<slot />` — this keeps Nuxt’s page pipeline intact (transitions, middleware/meta, error boundaries, suspense) and avoids edge cases seen with plain slots.
- Keep wrappers minimal; prefer using shared header/footer components rather than duplicating them per app.

## Creating a new layout
1) Add `packages/core/fireux-core/src/runtime/layouts/<name>.vue` following the rules above.
2) Export/register if needed in any module manifest so it’s auto-importable where required.
3) Update docs/nav presets if the layout should appear in navigation.

## Ecosystem/app-specific layouts
- Prefer reusing core layouts. Only add ecosystem-specific layouts when UI diverges meaningfully.
- If you reuse an existing name, you will shadow the core layout. Avoid collisions; prefer a prefix tied to your ecosystem (e.g. `cleanbox-dashboard`).
- TODO: add a guard to detect name collisions and app-local layout directories.
