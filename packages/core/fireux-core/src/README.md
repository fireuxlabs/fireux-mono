# Core source

| Entry                         | Responsibility                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [`module.ts`](module.ts)      | Core's Nuxt module entrypoint. Registers Core components, composables, root server handlers and Nuxt hooks.                   |
| [`config/`](config/README.md) | Shared App and module configuration, Rules composition and browser-storage declarations.                                      |
| [`runtime/`](runtime/)        | The native [Nuxt layer](runtime/nuxt.config.ts), shared runtime services, and Core's App, Ecosystem and User implementations. |
| [`types/`](types/)            | Shared types and Nuxt runtime configuration declarations.                                                                     |
| [`utils/`](utils/)            | Utilities shared by configuration and runtime.                                                                                |
| [`test/`](test/)              | Core checks, including [packed module and layer installation](test/installation.test.mjs).                                    |

The module and native layer have independent installation contracts. Optional
Workspace lives in [`fireux-workspace`](../../../extensions/fireux-workspace/).
