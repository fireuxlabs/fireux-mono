import { defineCollection, defineContentConfig } from '@nuxt/content'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = resolve(appRoot, '../../..')

export default defineContentConfig({
  collections: {
    fireuxDocs: defineCollection({
      type: 'page',
      source: [
        {
          cwd: repoRoot,
          // Nuxt Content derives its watch root from the static prefix before
          // the first wildcard. Keep the wildcard after the exact filename so
          // development watches AGENTS.md rather than the whole repository.
          include: 'AGENTS.md*',
          prefix: '/governance',
        },
        {
          cwd: resolve(repoRoot, 'docs/ai'),
          include: '*.md',
          prefix: '/ai',
        },
        {
          cwd: resolve(repoRoot, 'docs/concepts'),
          include: '*.md',
          prefix: '/concepts',
        },
      ],
    }),
  },
})
