import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'niederhorn',
  name: 'Niederhorn',
  shortName: 'Niederhorn',
  role: 'tenant',
  consoleFamilies: [],
  modules: [],
})

export default defineNuxtConfig(fireuxConfig)
