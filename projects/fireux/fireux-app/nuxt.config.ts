import { defineNuxtConfig } from 'nuxt/config'
// import { createFireuxConfig } from 'fireux-core/config/fireux-config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  ssr: true,
  modules: ['fireux-core'],
  components: [],
  plugins: [],
  css: [],
})
