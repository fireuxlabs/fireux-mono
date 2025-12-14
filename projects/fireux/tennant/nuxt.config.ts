import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/defineFireuxConfig'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'fireux',
    id: 'fireux-tenant',
    name: 'FireUX Tenant',
    shortName: 'Tenant',
    description: 'Tenant console for FireUX customers.',
    role: 'tenant',
    modules: [],
  })
)
