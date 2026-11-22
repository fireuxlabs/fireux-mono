# Core components

The [native layer](../nuxt.config.ts) registers shared components with the
`Fire` prefix. Atom, molecule, and organism folders are internal registration
roots. For example, `molecules/State.vue` exposes `FireState`.

Use native Nuxt UI first, shared semantic styles and tokens, and typed props
and events. Shared components need a genuine presentation or Core platform
responsibility and known consumers. Keep domain reads, writes, and authority
with their domain. A shared extension point should name its actual consumers
and its structural responsibility. A pure view accepts supplied values and
actions. A connected platform adapter states its session and lifecycle inputs.

## Vue file convention

Use template, script setup, then style. Omit empty blocks. Single-component
styles stay in the SFC, while shared styles use the owner's asset directory.
Keep private presentation logic small and explicitly imported. Use
[Lasagne](../../../../../../docs/concepts/lasagne.md) for local static child
namespaces, independent component responsibilities, and composition.

See the [structured data inspector](Diagnostics/README.md) for diagnostics.
