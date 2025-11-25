import { defineContentConfig } from '@nuxt/content/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineContentConfig({
  sources: {
    core: {
      driver: 'fs',
      base: resolve(currentDir, '../../packages/core/fireux-core/docs'),
    },
  },
})
