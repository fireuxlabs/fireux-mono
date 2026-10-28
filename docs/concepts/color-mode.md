# Color Mode

Updated: 2026-10-26
Role: map, not canon

## Purpose and authority

Map the native appearance owner. Inherit [global context](../ai/gpt-context.md)
and the [Nuxt UI integration map](nuxt-ui.md). Native API behavior belongs to
[Nuxt colour mode](https://color-mode.nuxtjs.org/usage/basic); this map records
FireUX's integration and storage choice.

## Ownership

Nuxt UI installs `@nuxtjs/color-mode` and configures `classSuffix: ''`.
Native `useColorMode()` from `#imports` exposes resolved `value`, selected
`preference`, and hydration/forced-mode state. Read `value` for mode-dependent
media; write `preference` for Light, Dark or System controls. Ordinary controls
may use Nuxt UI's ColorMode components directly.

Nuxt owns root classes, device-theme changes and `nuxt-color-mode` persistence.
The native module saves its preference automatically, initially System. Selecting
System stores that preference; clearing site data removes it. See the
[browser-storage inventory](../../packages/core/fireux-core/src/config/privacy/browser-storage.json)
and the [public storage page](../../packages/core/fireux-core/src/runtime/pages/legal/storage.vue).
No FireUX preference store, DOM observer, media listener, legacy-key migration
or activation hook sits alongside it.

Core [Logo](../../packages/core/fireux-core/src/runtime/app/components/Brand/Logo.vue),
[Wordmark](../../packages/core/fireux-core/src/runtime/app/components/Brand/Wordmark.vue),
[useAppView](../../packages/core/fireux-core/src/runtime/app/composables/useAppView.ts),
FireUX App [Fuel](../../projects/fireux/fireux-app/app/components/Landing/Fuel.vue)
and the [design specimen](../../packages/core/fireux-core/src/runtime/components/Library/Design/Contracts.vue)
consume native state. The App Shell does not bootstrap a second engine.
Brand asset-role selection and failed-image fallback stay with the brand owners;
native image controls do not replace those product rules by themselves.

## Tokens and previews

Use `:root.dark` for App tokens. A generic `.dark` selector can react to a nested
preview rather than the App theme. Local mode classes are valid for intentional
previews. The authored-Tailwind ban still applies; Nuxt UI's internal utilities
do not grant permission to add utilities in FireUX templates.

Avoid component-owned `prefers-color-scheme` listeners within the App shell.
Use native SSR/hydration state or Nuxt's ColorScheme boundary where a surface
cannot render safely before the preference is known.

## Verification and maintenance

When appearance ownership changes, inspect generated imports, Light/Dark/System,
reload persistence, OS-theme changes, initial hydration, and mode-specific brand
and failure behavior. Run representative App/package checks and confirm there
is only one root-class and storage owner. Update this map, the storage inventory
and public storage copy together when persistence behavior changes. Typechecks
alone do not establish visual or OS-change behavior.
