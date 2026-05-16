import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'bringli',
  id: 'bringli-app',
  name: 'Bringli',
  shortName: 'Bringli',
  meta: metaContent,
  role: 'global',
  consoleFamilies: ['supplier'],
  modules: ['fireux-suppliers'],
})

export default defineNuxtConfig(fireuxConfig)
