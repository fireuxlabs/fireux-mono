# Nuxt UI integration map

Updated: 2026-11-17
Ref: f798e3e99
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

The App bundle registers Nuxt UI in
[config.ts](../../packages/extensions/fireux-app/src/config.ts). Core supplies
its shared styles through
[main.css](../../packages/core/fireux-core/src/runtime/assets/styles/main.css)
and [main.scss](../../packages/core/fireux-core/src/runtime/assets/styles/main.scss).
Apps may declare semantic color roles in App configuration; package manifests
and the lockfile own the exact compatible versions.

Use the current stable Nuxt UI API supported by the consuming manifests and
inspect real consumers before retiring a FireUX mechanism. Native controls and
their supported props, slots and events are the foundation, not evidence that a
new FireUX shell or layout has the right responsibility. Apply the canonical
[component API rule](components.md#component-apis-and-extension-points) and
[layout admission](layouts.md#layout-admission) criteria. Domains retain their
meaning, readers, permissions and commands; Apps retain product framing and
route policy.

The repository-wide authored-Tailwind rule lives in
[global context](../ai/gpt-context.md#ui-and-design-system). Nuxt UI may use
Tailwind internally; that implementation does not grant FireUX source permission
to add utility strings. The global rule distinguishes exact approved adjustments
from migration debt.
See [component ownership and reuse](components.md) for the consumption rule,
shared component admission and current component evidence.

## Current shared frame

Workspace's [WorkspacePage.vue](../../packages/extensions/fireux-workspace/src/runtime/workspace/components/Page.vue)
composes Nuxt UI's dashboard panel around the App-supplied page slot with the shared
[Navbar.vue](../../packages/extensions/fireux-workspace/src/runtime/workspace/components/Navbar.vue)
and [Breadcrumbs.vue](../../packages/extensions/fireux-workspace/src/runtime/workspace/components/Breadcrumbs.vue).
Group links use Nuxt UI page cards through the ordinary
[PageLinks.vue](../../packages/extensions/fireux-workspace/src/runtime/workspace/components/PageLinks.vue)
content component. The frame uses semantic styles in
[workspace-surface.scss](../../packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/workspace-surface.scss).
WorkspaceNavbar owns selected identity and page actions; Dashboard's separate
Navbar retains its existing `ui` forwarding, which does not permit authored
utility overrides. The shared frame does not establish that every
header, domain component or App has completed styling migration. Route and
domain ownership remain as described in [Workspace](workspace.md) and
[Workspace Entity composition](family-workspace-entity.md).

## Refresh

Refresh this map when Core's Nuxt UI integration or the supported library
boundary changes. Read the version from package manifests and verify the
affected consumers; do not add dated version inventories, component catalogues
or browser-verification snapshots here.
