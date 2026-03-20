import { defineCollection, defineContentConfig } from '@nuxt/content'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = fileURLToPath(new URL('.', import.meta.url))
const fireuxDocsRoot = resolve(appRoot, '../../../packages/core/fireux-docs')

export default defineContentConfig({
  collections: {
    fireuxDocs: defineCollection({
      type: 'page',
      source: {
        cwd: fireuxDocsRoot,
        include: '**/README.md',
        exclude: ['node_modules/**', 'dist/**', '.output/**'],
        prefix: '/',
      },
    }),
  },
})
