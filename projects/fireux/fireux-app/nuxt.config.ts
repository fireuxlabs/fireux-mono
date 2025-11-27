import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createFireuxConfig } from 'fireux-core'

const baseConfig = createFireuxConfig({
  appName: 'FireUX',
  appShortName: 'FireUX',
  ecosystem: 'fireux',
  modules: ['fireux-fireux'],
  role: 'global',
  nitro: {
    firebase: {
      serverFunctionName: 'fireuxServer',
    },
  },
})

const currentDir = dirname(fileURLToPath(import.meta.url))
const coreDocsDir = resolve(
  currentDir,
  '../../..',
  'packages/core/fireux-core/docs'
)
const catalogueDocsDir = resolve(currentDir, '../../..', 'docs')

export default defineNuxtConfig(<NuxtConfig>{
  ...baseConfig,
  modules: [...(baseConfig.modules ?? []), '@nuxt/content'],
  content: {
    sources: {
      core: {
        driver: 'fs',
        base: coreDocsDir,
      },
      catalogue: {
        driver: 'fs',
        base: catalogueDocsDir,
      },
    },
  },
})
