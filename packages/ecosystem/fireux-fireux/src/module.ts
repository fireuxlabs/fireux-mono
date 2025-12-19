// FILE: packages/ecosystem/fireux-fireux/src/module.ts
import { defineNuxtModule } from '@nuxt/kit'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { setRuntimePublicEcosystem } from 'fireux-core/config/app/runtime'

export default defineNuxtModule({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
  },

  setup(_options, nuxt) {
    setRuntimePublicEcosystem(nuxt.options as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })
  },
})