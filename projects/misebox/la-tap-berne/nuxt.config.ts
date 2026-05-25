// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'la-tap-berne',
  name: 'La Tap Berne',
  shortName: 'La Tap Berne',
  role: 'tenant',
  designPacks: {
    publicMenu: {
      preset: 'dark-gold',
      color_mode: 'dark',
      accent: '#F0C84D',
    },
  },
  consoles: ['kitchen'],
  profiles: [],
  navHiddenKeys: ['kitchens'],
  modules: ['fireux-kitchens'],
})
