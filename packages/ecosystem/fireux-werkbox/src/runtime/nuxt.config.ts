import type { NuxtConfig } from '@nuxt/schema'

export default {
  extends: ['fireux-core/layer'],
  srcDir: '.',
  serverDir: './server',
  dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
} satisfies NuxtConfig
