# Core App configuration

This directory supplies the App contract and shared Nuxt configuration helpers.
[`defineFireuxApp`](../../../../../extensions/fireux-app/src/config.ts) in
`fireux-app` assembles the concrete Nuxt configuration, as used by
[La Tap Berne](../../../../../../projects/misebox/la-tap-berne/nuxt.config.ts).
The [App config map](../../../../../../docs/concepts/app-config.md) explains
which choices belong to Apps, Extensions and Ecosystems.

| Source                                                                                 | What uses it                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`types.ts`](types.ts), [`validate.ts`](validate.ts)                                   | The App builder validates the authored assembly input before composing modules, layers and runtime configuration.                                                                                                                                                                          |
| [`runtime.ts`](runtime.ts)                                                             | The App builder and Ecosystem module publish runtime projections. [`useFireUXConfig`](../../runtime/app/composables/config/FireUXConfig.ts) normalizes App data for browser and server consumers. Initial App context, authored SEO inputs and metadata use private runtime configuration. |
| [`nuxt-defaults.ts`](nuxt-defaults.ts), [`vite.ts`](vite.ts)                           | The App builder applies shared Nuxt defaults, CSS and transition integration, and workspace dependency resolution.                                                                                                                                                                         |
| [`nitro.ts`](nitro.ts), [`pwa.ts`](pwa.ts)                                             | The App builder configures Firebase Functions output and PWA support from App inputs. [Ecosystem wiring](../module/README.md) supplies the shared SSR region and execution identity.                                                                                                       |
| [`meta-content-loader.ts`](meta-content-loader.ts), [`seo-content.ts`](seo-content.ts) | The App builder loads an explicit `meta` input or `app/meta.ts`, then derives SEO description and routes from its literature.                                                                                                                                                              |
| [`seo-config.ts`](seo-config.ts), [`seo-routes.ts`](seo-routes.ts)                     | The [Core Nuxt module](../../module.ts) resolves indexing policy, collects extension sitemap contributions and discovers static routes from Nuxt pages.                                                                                                                                    |

## Firebase

The App builder reads the App's `NUXT_FIREBASE_APP_ID` and optional
`NUXT_FIREBASE_API_KEY`. [`firebase.ts`](firebase.ts) combines them with the
Ecosystem binding, then installs VueFire with the App's Auth setting.

[`database.ts`](database.ts) applies an App database override after the
Ecosystem module binds Firebase. It changes the App runtime database and
preserves identity scope, including `(default)` when the binding has no named
database. The [client resolver](../../runtime/composables/fireux/firestore/vuefire.ts)
and [server resolver](../../runtime/server/utils/getRuntimeFirestore.ts) use
those scopes for App data and canonical identities.

Normal development uses configured Firebase services. To test locally, start
the Emulator Hub with Firestore and Auth when enabled, then start Nuxt with
`VUEFIRE_EMULATORS=true`. VueFire connects the default client database and
Core connects named instances to the same discovered host. An opted-in App
requires successful discovery. [Nitro's runtime check](../../runtime/plugins/firebase/firebase-emulators.nitro.ts)
requires matching SDK emulator hosts and rejects them in production.

[`getAdminApp()`](../../runtime/server/utils/getAdmin.ts) selects the bound
Ecosystem Firebase project for server work. The
[SSR plugin](../../runtime/plugins/firebase/firebase-admin-fallback.server.ts)
initializes the same named Admin instance before VueFire injects it.
Cross-project access stays with its App, as in the
[FireUX portal directory](../../../../../../projects/fireux/fireux-app/server/utils/firebase-admin.ts).

See the [Firebase integration](../../test/firebase-integration.test.mjs),
[database routing](../../test/firestore-routing.test.mjs) and
[Admin credential](../../test/admin-credentials.test.mjs) checks.
