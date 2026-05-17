import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'buenohost',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  databaseId: 'buenohost',
  meta: metaContent,
  role: 'standalone',
  consoleFamilies: ['property'],
  seo: {
    siteUrl: 'https://buenohost.web.app',
  },
  modules: ['fireux-properties'],
})

const fireuxRuntimeConfig = (fireuxConfig.runtimeConfig || {}) as Record<string, any>
const fireuxPublicRuntimeConfig = (fireuxRuntimeConfig.public || {}) as Record<string, any>

export default defineNuxtConfig({
  ...fireuxConfig,
  runtimeConfig: {
    ...fireuxRuntimeConfig,
    public: {
      ...fireuxPublicRuntimeConfig,
      fireuxBaseUrl: process.env.NUXT_PUBLIC_FIREUX_BASE_URL || '',
      buenoHostBaseUrl: process.env.NUXT_PUBLIC_BUENOHOST_BASE_URL || 'https://buenohost.web.app',
      miseboxBaseUrl: process.env.NUXT_PUBLIC_MISEBOX_BASE_URL || '',
      cleanboxBaseUrl: process.env.NUXT_PUBLIC_CLEANBOX_BASE_URL || '',
      sproochliBaseUrl: process.env.NUXT_PUBLIC_SPROOCHLI_BASE_URL || '',
      findMySeoBaseUrl: process.env.NUXT_PUBLIC_FIND_MY_SEO_BASE_URL || '',
    },
  },
})
