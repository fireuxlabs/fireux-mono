# Core layouts

[FireuxApp](../app/components/FireuxApp.vue) owns the ordinary App root, with
one UApp and one native NuxtLayout/NuxtPage pair. The
[default layout](default.vue) owns public chrome and the main landmark.
[Dashboard](dashboard.vue) owns account and App chrome. Domain pages supply
content through the native page slot. Optional
[Workspace](../../../../../extensions/fireux-workspace/README.md#layout) owns
its layout, frame, and manifest override.

## Layout admission

Choose an existing native layout unless a real route family needs distinct
chrome or lifecycle ownership. Name its consumers and the difference from the
nearest layout. A native layout owns one root, its outlet and landmarks, and
preserves initialization, transition, disposal, and error behaviour. Use
ordinary named component composition for a difference in page content.

## Other route families

A bare or embed surface owns its main landmark and the lifecycle it actually
needs. Keep Go QR's embed entry App-owned. Derive transitions from native
layout metadata and explicit overrides through
[the Core policy](../../config/module/pages-config.ts). Route access is
documented with [Core pages](../pages/README.md#route-availability-and-sign-in).

## Appearance

Nuxt owns Light, Dark and System preference and persistence.
Core [Logo](../app/components/Brand/Logo.vue) and
[Wordmark](../app/components/Brand/Wordmark.vue) use the resolved native mode.
App tokens target `:root.dark`. Nested conditions are reserved for intentional
previews. The [browser storage inventory](../../config/privacy/browser-storage.json)
owns the native preference disclosure.
