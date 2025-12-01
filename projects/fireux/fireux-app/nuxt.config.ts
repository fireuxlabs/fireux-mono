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
  pwa: {
    manifest: {
      icons: [
        {
          src: '/img/app/pwa/fireux-icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/img/app/pwa/fireux-icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
  },
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
