// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'fireux-template',
  name: 'FireUX Template',
  shortName: 'Template',
  role: 'tenant',
  modules: ['fireux-products', 'fireux-blogs'],
})
