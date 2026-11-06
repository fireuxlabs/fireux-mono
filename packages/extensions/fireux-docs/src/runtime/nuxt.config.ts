import type { NuxtConfig } from '@nuxt/schema'
import { addTemplate, updateTemplates } from '@nuxt/kit'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { coreInventory } from '../catalogue/core-inventory.mjs'

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
        filename: 'fireux-core-inventory.ts',
        write: true,
        getContents: () =>
          `export default ${JSON.stringify(coreInventory(coreRoot, components, readFileSync(previewFile, 'utf8')))}`,
      })
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
              template.filename === 'fireux-core-inventory.ts',
          })
        }
      })
    },
  ],
  dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
} satisfies NuxtConfig
