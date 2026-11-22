# Core runtime

Core supplies the neutral App shell, identity, access, and Firebase integration.
Use the native [layer](nuxt.config.ts) and the [Core module](../module.ts) through
their documented package exports.

- [App](app/README.md), [User](user/README.md), and [Ecosystem](ecosystem/README.md)
  own their records, reads, and trusted commands.
- [Components](components/README.md), [composables](composables/README.md),
  [layouts](layouts/README.md), [pages](pages/README.md), and the
  [server](server/README.md) describe the shared runtime where it extends Nuxt.
- [Configuration](../config/README.md) owns assembly-time integration.
  [Workspace](../../../../extensions/fireux-workspace/README.md) is optional and
  registers its own runtime. Core Dashboard remains part of Core.
