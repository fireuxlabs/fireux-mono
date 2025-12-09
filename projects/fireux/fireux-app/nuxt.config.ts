import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createFireuxConfig } from 'fireux-core'

const baseConfig = createFireuxConfig({
  appName: 'FireUX',
  appShortName: 'FireUX',
  appDescription: 'Core workspace for FireUX platform operations.',
  ecosystem: 'fireux',
  modules: [
    'fireux-fireux',
    'fireux-ecosystem-controller',
    'fireux-products',
    'fireux-blogs',
  ],
  role: 'global',
  nitro: {
    firebase: {
      serverFunctionName: 'fireuxServer',
    },
  },
})

const currentDir = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(currentDir, '../../..', 'docs')

export default defineNuxtConfig(<NuxtConfig>{
  ...baseConfig,
  modules: [...(baseConfig.modules ?? []), '@nuxt/content'],
  content: {
    sources: {
      fireuxDocs: {
        driver: 'fs',
        base: docsDir,
      },
    },
  },
})
