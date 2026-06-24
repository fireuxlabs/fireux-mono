# Color Mode

Updated: 2026-06-24
Ref: 2ec25ffba

## Purpose

Map the Nuxt UI light/dark spine as used by FireUX so app chrome, tenant chrome, and shared components do not invent competing colour-mode systems.

## Spine

- Owner: Nuxt UI installs `@nuxtjs/color-mode` when `ui.colorMode` is enabled.
- Nuxt UI setup: `@nuxt/ui` registers `@nuxtjs/color-mode` with `classSuffix: ''`.
- Root behavior: `@nuxtjs/color-mode` applies `light` or `dark` to the document root.
- FireUX compatibility: `packages/core/fireux-core/src/runtime/composables/fireux/app/useColorMode.ts` currently mirrors the same storage/class behavior for shared runtime code.
- Token behavior: custom CSS tokens should react through `:root.dark`, not a loose `.dark` selector.
- JS display behavior: components that need the current visible mode should use `useResolvedColorMode()`.
- JS preference behavior: components that edit the user's setting may use `useColorMode()`.

## Allowed Deltas

- Tailwind/Nuxt UI `dark:` utilities are fine in templates because they follow the root mode class.
- Tenant apps may define app-local tokens in app config or app CSS using `:root` and `:root.dark`.
- Isolated renderers and previews may use explicit local classes when they intentionally preview a mode, for example a menu preview that renders light and dark without changing the whole app.

## Avoid

- Do not scope app tokens to generic `.dark`; it can react to nested classes and make light/dark behavior hard to trace.
- Do not use `useColorMode().value` when the component needs the actual rendered mode; `system` must be resolved first.
- Avoid `prefers-color-scheme` in component CSS unless the component is intentionally outside the FireUX app shell.
- Do not add a second FireUX-owned colour-mode system; prefer Nuxt UI / `@nuxtjs/color-mode` and keep FireUX helpers thin.
