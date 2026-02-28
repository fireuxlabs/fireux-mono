import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'fireux-template',
  name: 'FireUX Template',
  shortName: 'Template',
  role: 'tenant',
  modules: ['fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig(fireuxConfig)
