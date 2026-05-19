import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'la-tap-berne',
  name: 'La Tap Berne',
  shortName: 'La Tap Berne',
  appLogoLight: '/img/app/logo-light.svg',
  appLogoDark: '/img/app/logo-dark.svg',
  role: 'tenant',
  consoleFamilies: [],
  modules: [],
})

export default defineNuxtConfig(fireuxConfig)
