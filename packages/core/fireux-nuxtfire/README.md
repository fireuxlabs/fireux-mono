# fireux-nuxtfire

A small bridge module that ensures VueFire is configured early (Nuxt module setup time) and that the Firebase Web SDK is initialised once on the client.

## Contract

- Reads:
  - `runtimeConfig.public.firebaseEcosystem.firebase` (`apiKey`, `authDomain`, `projectId`, optional `storageBucket`, `messagingSenderId`)
  - `runtimeConfig.public.firebaseApp` (optional `appId`, `measurementId`)
- Writes (during module setup):
  - `nuxt.options.vuefire.config`
  - `nuxt.options.vuefire.auth.enabled = true`
- Adds:
  - Client plugin `runtime/plugins/firebase.client.ts`

This module is intended to be installed before `nuxt-vuefire`.
