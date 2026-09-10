import type { NuxtConfig } from '@nuxt/schema'

export default {
  srcDir: '.',
  serverDir: './server',
  dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
} satisfies NuxtConfig
