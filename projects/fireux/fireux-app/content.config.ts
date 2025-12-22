import { defineCollection, defineContentConfig } from '@nuxt/content'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(currentDir, '../../..', 'docs')

export default defineContentConfig({
  collections: {
    // Default app content (keeps Nuxt Content behaving as expected)
    content: defineCollection({
      type: 'page',
      source: '**/*',
    }),

    // Repo-wide docs/ folder content
    fireuxDocs: defineCollection({
      type: 'page',
      source: {
        cwd: docsDir,
        include: '**/*.{md,mdc}',
        exclude: ['copilot-documentation/imported/root/profiles-stack.md'],
      },
    }),
  },
})
