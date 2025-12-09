import { defineContentConfig } from '@nuxt/content/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(currentDir, '../../..', 'docs')

export default defineContentConfig({
  sources: {
    fireuxDocs: {
      driver: 'fs',
      base: docsDir,
    },
  },
})
