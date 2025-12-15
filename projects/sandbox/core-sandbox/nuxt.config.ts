import type { NuxtConfig } from 'nuxt/schema'

export default <NuxtConfig>{
  compatibilityDate: '2025-12-15',
  nitro: {
    compatibilityDate: '2025-12-15',
  },
  srcDir: 'app',
  modules: [
    'fireux-core',
    'fireux-sandbox',
  ],
  devtools: { enabled: true },
}
