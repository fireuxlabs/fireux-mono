# fireux-ecosystem

Shared FireUX ecosystem Main App composition. See [App configuration](../../../docs/concepts/app-config.md) for its current entrypoint and ownership.

[`defineFireuxEcosystem`](src/config.ts) requires a global Main App. It adds the
shared Main App layer and delegates standard assembly to
[`fireux-app`](../fireux-app/README.md). A named Ecosystem package supplies the
App family's Firebase and SSR bindings. Core and standalone consumers may
compose their required modules and layers directly.
