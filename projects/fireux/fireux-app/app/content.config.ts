import { defineCollection, defineContentConfig } from '@nuxt/content'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(currentDir, '../../../..', 'docs')

export default defineContentConfig({
  collections: {
    fireuxDocs: defineCollection({
      type: 'page',
      source: {
        cwd: docsDir,
        include: '**/*.{md,mdc}',
      },
    }),
  },
})
