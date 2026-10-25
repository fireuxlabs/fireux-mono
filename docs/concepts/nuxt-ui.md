# Nuxt UI integration map

Updated: 2026-10-25
Ref: ce2861c77
Role: map, not canon

## Purpose and authority

Nuxt UI owns its public component, accessibility and theme APIs. Use its
[official documentation](https://ui.nuxt.com/docs/getting-started) for API
details. This map records FireUX's integration and the boundary with Core,
domains and Apps. Current package manifests, registration and consumers establish
implementation; this prose does not claim every component has been audited.

## Upstream references

- [Nuxt UI documentation](https://ui.nuxt.com/docs/getting-started)
- [Installation in Nuxt](https://ui.nuxt.com/docs/getting-started/installation/nuxt)
- [Components](https://ui.nuxt.com/docs/components)
- [Theme and design system](https://ui.nuxt.com/docs/getting-started/theme/design-system)
- [Releases](https://ui.nuxt.com/docs/releases)

## FireUX integration

Core registers Nuxt UI in
[nuxt-baseline.ts](../../packages/core/fireux-core/src/config/app/nuxt-baseline.ts)
and includes its stylesheet through the shared
[main.css](../../packages/core/fireux-core/src/runtime/assets/styles/main.css)
and [main.scss](../../packages/core/fireux-core/src/runtime/assets/styles/main.scss).
Apps may declare semantic color roles in App configuration; package manifests
and the lockfile own the exact compatible versions.

Use native Nuxt UI controls and their supported props, slots and events by
default. Core adds a shared component only for a real FireUX-wide interaction,
layout or lifecycle responsibility. Domain components retain domain meaning,
readers, permissions and commands. App components retain product framing and
route policy.

The repository-wide authored-Tailwind rule lives in
[global context](../ai/gpt-context.md#ui-and-design-system). Nuxt UI may use
Tailwind internally; that implementation does not grant FireUX source permission
to add utility strings. Existing authored utilities remain migration debt.
See [component ownership and reuse](components.md) for the consumption rule,
shared component admission and current component evidence.

## Current shared frame

Core's [WorkspacePage.vue](../../packages/core/fireux-core/src/runtime/workspace/components/Page.vue)
composes Nuxt UI's dashboard panel and route outlet with the shared
[Navbar.vue](../../packages/core/fireux-core/src/runtime/workspace/components/Navbar.vue)
and [Breadcrumbs.vue](../../packages/core/fireux-core/src/runtime/workspace/components/Breadcrumbs.vue).
Group links use Nuxt UI page cards through the ordinary
[PageLinks.vue](../../packages/core/fireux-core/src/runtime/workspace/components/PageLinks.vue)
content component. The frame uses semantic styles in
[workspace-surface.scss](../../packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/workspace-surface.scss).
Navbar retains its existing `ui` forwarding API; this does not permit callers
to author utility overrides. The shared frame does not establish that every
header, domain component or App has completed styling migration. Route and
domain ownership remain as described in [Workspace](workspace.md) and
[Workspace Entity composition](family-workspace-entity.md).

## Refresh

Refresh this map when Core's Nuxt UI integration or the supported library
boundary changes. Read the version from package manifests and verify the
affected consumers; do not add dated version inventories, component catalogues
or browser-verification snapshots here.
