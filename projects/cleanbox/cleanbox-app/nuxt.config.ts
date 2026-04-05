import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'cleanbox',
  id: 'cleanbox-app',
  name: 'Cleanbox',
  shortName: 'Cleanbox',
  meta: metaContent,
  role: 'global',
  consoleFamilies: [],
  modules: ['fireux-jobs', 'fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig(fireuxConfig)
