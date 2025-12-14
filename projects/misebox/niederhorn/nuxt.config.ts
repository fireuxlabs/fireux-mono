import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/defineFireuxConfig'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'misebox',
    id: 'niederhorn',
    name: 'Niederhorn',
    shortName: 'Niederhorn',
    description: 'Tenant experience for Niederhorn hospitality partners.',
    role: 'tenant',
    modules: [
      // tenants are intentionally slim
      // domain-specific modules live on the global app
    ],
  })
)
