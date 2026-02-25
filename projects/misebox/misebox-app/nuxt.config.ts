import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox', 
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  role: 'global', 
  modules: [
    'fireux-places',
    'fireux-companies',
    'fireux-kitchens',
    'fireux-orders',
    'fireux-drop',
    ['fireux-jobs', { workplaces: ['kitchen', 'ship', 'truck'] }],
    'fireux-products',
    'fireux-blogs',
  ],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  experimental: {
    ...(fireuxConfig.experimental || {}),
    // Avoid stale dev client requests to /_nuxt/builds/meta/dev.json.
    appManifest: process.env.NODE_ENV === 'production',
  },
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
  pwa: {
    ...(fireuxConfig.pwa || {}),
    registerType: 'autoUpdate',
    workbox: {
      ...(fireuxConfig.pwa?.workbox || {}),
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
    },
    // Keep service worker disabled during local development.
    devOptions: {
      ...(fireuxConfig.pwa?.devOptions || {}),
      enabled: false,
    },
  },
})
