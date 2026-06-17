Components spine map
Updated: 2026-06-17
Ref: 37fb262f0
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
- `X/Edit`
- `X/Overview`
- `Console/X/*`

Console component folders:
- `Console/X/Index`
- `Console/X/Overview`
- `Console/X/Identity`
- `Console/X/Team`
- `Console/X/Operations`

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
