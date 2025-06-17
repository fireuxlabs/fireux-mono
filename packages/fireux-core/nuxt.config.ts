import { defineNuxtConfig } from 'nuxt/config'

// This config is ONLY for module development
// It enables auto-imports within the module itself
export default defineNuxtConfig({
  srcDir: 'src/runtime',

  // Enable auto-imports for module development
  imports: {
    dirs: ['composables/**', 'utils/**'],
  },

  // Module dependencies for development
  modules: ['@nuxt/ui', 'nuxt-vuefire'],

  // TypeScript configuration
  typescript: {
    typeCheck: false, // Avoid conflicts with module build
  },

  // Build configuration
  build: {
    transpile: ['vue'],
  },
})
