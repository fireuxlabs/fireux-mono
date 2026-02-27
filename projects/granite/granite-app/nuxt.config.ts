import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

process.env.APP_DOMAIN ||= 'granite-os.web.app'
process.env.NUXT_FIREBASE_APP_ID ||= '1:614334323822:web:2b727e355a3d19d4cd5a7f'
process.env.NUXT_FIREBASE_MEASUREMENT_ID ||= 'G-ZY6RY281XV'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'granite',
  id: 'granite-app',
  name: 'Granite',
  shortName: 'Granite',
  role: 'global',
  modules: [
    'fireux-properties',
    'fireux-compliance',
    'fireux-documents',
    'fireux-tasks',
  ],
})

export default defineNuxtConfig(fireuxConfig)
