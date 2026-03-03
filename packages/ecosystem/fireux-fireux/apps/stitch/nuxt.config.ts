import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'stitch-app',
  name: 'Stitch',
  shortName: 'Stitch',
  role: 'tenant',
})

export default defineNuxtConfig(fireuxConfig)
