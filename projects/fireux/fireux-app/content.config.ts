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
          cwd: resolve(repoRoot, 'packages/ecosystem/fireux-misebox/docs/ai'),
          include: '*.md',
          prefix: '/ai/misebox',
        },
        {
          cwd: resolve(repoRoot, 'packages/ecosystem/fireux-werkbox/docs/ai'),
          include: '*.md',
          prefix: '/ai/werkbox',
        },
        {
          cwd: resolve(repoRoot, 'packages/ecosystem/fireux-buenohost/docs/ai'),
          include: '*.md',
          prefix: '/ai/buenohost',
        },
        {
          cwd: resolve(repoRoot, 'packages/ecosystem/fireux-sharer/docs/ai'),
          include: '*.md',
          prefix: '/ai/sharer',
        },
        {
          cwd: resolve(repoRoot, 'packages/ecosystem/fireux-slap/docs/ai'),
          include: '*.md',
          prefix: '/ai/slap',
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
