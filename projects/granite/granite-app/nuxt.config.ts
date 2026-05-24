import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'granite',
  id: 'granite-app',
  name: 'Granite',
  shortName: 'Granite',
  role: 'global',
  consoles: ['portfolio'],
  modules: [
    'fireux-properties',
    'fireux-compliance',
    'fireux-documents',
    'fireux-tasks',
    'fireux-products',
    'fireux-blogs',
  ],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  vite: {
    ...(fireuxConfig.vite || {}),
    server: {
      ...(fireuxConfig.vite?.server || {}),
      allowedHosts: ['.ngrok-free.app'],
    },
  },
})
