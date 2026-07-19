// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'
import kitchenConfig from './app/config/kitchen.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'la-tap-berne',
  name: 'La Tap Berne',
  shortName: 'La Tap Berne',
  role: 'tenant',
  seo: {
    siteUrl: 'https://tapberne.web.app',
  },
  consoles: ['kitchen'],
  consoleConfig: {
    kitchen: {
      canCreate: kitchenConfig.canCreate,
      targetIds: [...kitchenConfig.kitchens],
    },
  },
  navHiddenKeys: ['kitchens', 'places'],
  modules: ['fireux-places', 'fireux-go-qr', 'fireux-kitchens', 'fireux-sproochli'],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
})
