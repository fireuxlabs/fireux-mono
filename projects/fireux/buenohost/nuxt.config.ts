import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'buenohost',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  databaseId: 'buenohost',
  meta: metaContent,
  role: 'standalone',
  consoleFamilies: ['bnb'],
  seo: {
    siteUrl: 'https://buenohost.web.app',
  },
  modules: [],
})

const fireuxRuntimeConfig = (fireuxConfig.runtimeConfig || {}) as Record<string, any>
const fireuxPublicRuntimeConfig = (fireuxRuntimeConfig.public || {}) as Record<string, any>

export default defineNuxtConfig({
  ...fireuxConfig,
  runtimeConfig: {
    ...fireuxRuntimeConfig,
    public: {
      ...fireuxPublicRuntimeConfig,
      sproochliBaseUrl: process.env.NUXT_PUBLIC_SPROOCHLI_BASE_URL || '',
    },
  },
})
