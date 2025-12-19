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
    // ✅ log ecosystem config immediately (before anything else can crash later)
    // eslint-disable-next-line no-console
    console.log('[fireux-fireux] ecosystemConfig', ecosystemConfig)

    // ✅ write into runtime using the NEW shape
    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })

    // ✅ log what we actually wrote
    // eslint-disable-next-line no-console
    console.log(
      '[fireux-fireux] runtime.public.firebaseEcosystem',
      (nuxt.options.runtimeConfig as any)?.public?.firebaseEcosystem
    )
  },
})