# Core configuration

| Folder                        | Responsibility                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`app/`](app/README.md)       | Core contracts and helpers used to assemble a Nuxt App and configure its runtime.                                                 |
| [`module/`](module/README.md) | Nuxt module registration and shared Ecosystem wiring.                                                                             |
| [`firebase/`](firebase/)      | Shared Firestore Rules fragments and composition. See the [Rules ownership map](../../../../../docs/concepts/firestore-rules.md). |
| [`privacy/`](privacy/)        | The authored [browser-storage inventory](privacy/browser-storage.json).                                                           |

Concrete Apps own their configuration and deployment targets. Named Ecosystem
packages supply their shared Firebase bindings.
