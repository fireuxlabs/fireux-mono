import type { NuxtConfig } from '@nuxt/schema'

export default {
  srcDir: '.',
  components: [{ path: './components', prefix: 'Fire', pathPrefix: true }],
  serverDir: './server',
  dir: { pages: 'pages' },
} satisfies NuxtConfig
