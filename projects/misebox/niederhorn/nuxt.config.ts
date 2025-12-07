import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Niederhorn',
    appShortName: 'Niederhorn',
     appDescription: 'Tenant experience for Niederhorn hospitality partners.',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
    role: 'tenant',
    nitro: {
      firebase: {
        serverFunctionName: 'niederhornServer',
      },
    },
  }),
})
