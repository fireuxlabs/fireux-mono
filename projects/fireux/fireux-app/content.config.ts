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
          include: 'AGENTS.md',
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
