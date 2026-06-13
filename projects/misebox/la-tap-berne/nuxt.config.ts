// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import kitchenConfig from './app/config/kitchen.config'

const kitchenConsoleConfig = {
  canCreate: kitchenConfig.canCreate,
  targetIds: [...kitchenConfig.kitchens],
}

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'la-tap-berne',
  name: 'La Tap Berne',
  shortName: 'La Tap Berne',
  role: 'tenant',
  membership: 'restricted',
  consoles: ['kitchen'],
  consoleConfig: {
    kitchen: kitchenConsoleConfig,
  },
  profiles: [],
  navHiddenKeys: ['kitchens', 'places'],
  modules: ['fireux-places', 'fireux-kitchens', 'fireux-sproochli'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
})
