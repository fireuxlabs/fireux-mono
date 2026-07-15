// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'
import kitchenConfig from './app/config/kitchen.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'baeren-ringgenberg',
  name: 'Hotel Bären Ringgenberg',
  shortName: 'Bären Ringgenberg',
  role: 'tenant',
  seo: {
    siteUrl: 'https://baeren-ringgenberg.web.app',
  },
  consoles: ['kitchen'],
  consoleConfig: {
    kitchen: {
      canCreate: kitchenConfig.canCreate,
      targetIds: [...kitchenConfig.kitchens],
    },
  },
  navHiddenKeys: ['kitchens', 'places', 'companies', 'agents', 'professionals'],
  modules: [
    'fireux-places',
    'fireux-companies',
    'fireux-go-qr',
    'fireux-kitchens',
    'fireux-sproochli',
    ['fireux-jobs', { workplaces: ['hotel', 'restaurant', 'bar', 'kitchen'] }],
  ],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
})
