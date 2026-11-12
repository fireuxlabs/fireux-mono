import { fileURLToPath } from 'node:url'
import type { NuxtConfig } from '@nuxt/schema'

export default {
  srcDir: '.',
  components: [
    { path: './components', prefix: 'Fire', pathPrefix: true },
    { path: './app/components', prefix: 'App', pathPrefix: true },
  ],
  imports: {
    dirs: [
      fileURLToPath(new URL('./app/composables/pricing', import.meta.url)),
    ],
  },
  css: [fileURLToPath(new URL('./assets/styles/main.scss', import.meta.url))],
  serverDir: './server',
  dir: { pages: 'pages' },
} satisfies NuxtConfig
