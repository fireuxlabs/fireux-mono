import type { NuxtConfig } from '@nuxt/schema'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export default {
  srcDir: '.',
  components: [
    ...['atoms', 'molecules', 'organisms']
      .filter((category) =>
        existsSync(
          fileURLToPath(new URL(`./components/${category}`, import.meta.url))
        )
      )
      .map((category) => ({
        path: `./components/${category}`,
        prefix: 'Fire',
        pathPrefix: true,
      })),
    {
      path: './components',
      prefix: 'Fire',
      pathPrefix: true,
      ignore: ['atoms/**', 'molecules/**', 'organisms/**'],
    },
  ],
  serverDir: './server',
  dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
} satisfies NuxtConfig
