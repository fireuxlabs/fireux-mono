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
[component API rule](../../packages/core/fireux-core/src/runtime/components/README.md) and
[layout admission](../../packages/core/fireux-core/src/runtime/layouts/README.md#layout-admission) criteria. Domains retain their
meaning, readers, permissions and commands; Apps retain product framing and
route policy.

See [AGENTS.md](../../AGENTS.md#architecture-and-ui) for repository UI rules.
See [component ownership and reuse](../../packages/core/fireux-core/src/runtime/components/README.md) for the consumption rule,
shared component admission and current component evidence.

## Workspace

The [Workspace package README](../../packages/extensions/fireux-workspace/README.md)
explains the shared shell and how Misebox composes it through its parent route.

## Refresh

Refresh this map when Core's Nuxt UI integration or the supported library
boundary changes. Read the version from package manifests and verify the
affected consumers; do not add dated version inventories, component catalogues
or browser-verification snapshots here.
