import type { NuxtConfig } from '@nuxt/schema'
import { addTemplate, updateTemplates } from '@nuxt/kit'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { coreInventory, publicLibrary } from '../catalogue/core-inventory.mjs'

const coreRoot = fileURLToPath(
  new URL('../../../../core/fireux-core/src/runtime', import.meta.url)
)
const previewFile = fileURLToPath(
  new URL('./components/CorePreview.vue', import.meta.url)
)

export default {
  srcDir: '.',
  serverDir: './server',
  components: [{ path: './components', prefix: 'Docs', pathPrefix: true }],
  modules: [
    (_options, nuxt) => {
      let components: { filePath: string; pascalName: string }[] = []
      addTemplate({
        filename: 'fireux-public-components.ts',
        write: true,
        getContents: () =>
          `export default ${JSON.stringify(publicLibrary(coreRoot, components, readFileSync(previewFile, 'utf8')))}`,
      })
      addTemplate({
        filename: 'fireux-core-inventory.ts',
        write: true,
        getContents: () =>
          `export default ${JSON.stringify(nuxt.options.dev ? coreInventory(coreRoot, components, readFileSync(previewFile, 'utf8')) : [])}`,
      })
      if (!nuxt.options.dev) {
        nuxt.hook('pages:extend', (pages) => {
          const removeInternal = (entries: typeof pages) => {
            for (let index = entries.length - 1; index >= 0; index--) {
              const page = entries[index]
              if (
                page.file
                  ?.replaceAll('\\', '/')
                  .includes('/pages/dev/core-components/')
              ) {
                entries.splice(index, 1)
              } else if (page.children) removeInternal(page.children)
            }
          }
          removeInternal(pages)
        })
      }
      nuxt.hook('components:extend', (registered) => {
        components = registered
      })
      nuxt.hook('builder:watch', async (_event, path) => {
        if (
          path.includes('fireux-core/src/runtime') ||
          path.includes('CorePreview.vue')
        ) {
          await updateTemplates({
            filter: (template) =>
              [
                'fireux-core-inventory.ts',
                'fireux-public-components.ts',
              ].includes(template.filename),
          })
        }
      })
    },
  ],
  dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
} satisfies NuxtConfig
