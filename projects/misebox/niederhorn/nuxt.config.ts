import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'niederhorn',
  name: 'Niederhorn',
  shortName: 'Niederhorn',
  role: 'tenant',
  modules: [
    // tenants are intentionally slim
    // domain-specific modules live on the global app
  ],
})

export default defineNuxtConfig(fireuxConfig)
