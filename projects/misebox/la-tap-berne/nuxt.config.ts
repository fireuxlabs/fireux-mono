// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'la-tap-berne',
  name: 'La Tap Berne',
  shortName: 'La Tap Berne',
  role: 'tenant',
  appLogo: '/img/app/logo.png',
  appLogoLight: '/img/app/logo-light.png',
  appLogoDark: '/img/app/logo-dark.png',
  consoles: ['kitchen'],
  profiles: [],
  navHiddenKeys: ['kitchens', 'places'],
  modules: ['fireux-places', 'fireux-kitchens'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
})
