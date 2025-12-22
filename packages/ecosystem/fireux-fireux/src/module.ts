// FILE: packages/ecosystem/fireux-fireux/src/module.ts
import { defineNuxtModule } from '@nuxt/kit'

import { setRuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'
import { ecosystemConfig } from './config/firebase/ecosystem.config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
  },

  setup(_options, nuxt) {
    const debug = !!process.env.FIREUX_DEBUG_ECOSYSTEM
    if (debug) {
      console.log(
        '[fireux-fireux/module] loaded ecosystemConfig.id',
        ecosystemConfig?.id
      )
      console.log(
        '[fireux-fireux/module] loaded ecosystemConfig.firebase',
        ecosystemConfig?.firebase
      )
    }

    // 🔎 Make the runtime write-shape explicit
    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })

    // 🔎 Confirm it actually landed where we expect
    const pub = (nuxt.options.runtimeConfig as any)?.public
    if (debug) {
      console.log(
        '[fireux-fireux/module] after setRuntimeFirebaseEcosystem public.firebaseEcosystem',
        pub?.firebaseEcosystem
      )
    }
  },
})