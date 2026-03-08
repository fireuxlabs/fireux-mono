# fireux-nuxtfire

A small bridge module that ensures VueFire is configured early at Nuxt module setup time.

## Contract

- Reads:
  - `runtimeConfig.public.firebaseEcosystem.firebase` (`apiKey`, `authDomain`, `projectId`, optional `storageBucket`, `messagingSenderId`)
  - `runtimeConfig.public.firebaseApp` (optional `appId`, `measurementId`)
- Writes (during module setup):
  - `nuxt.options.vuefire.config`
  - `nuxt.options.vuefire.auth.enabled = true`

This module is intended to be installed before `nuxt-vuefire`.
