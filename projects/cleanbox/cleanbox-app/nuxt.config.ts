// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'cleanbox',
  projectId: 'cleanbox',
  ecosystemId: 'cleanbox',
  id: 'cleanbox-app',
  name: 'Cleanbox',
  shortName: 'Cleanbox',
  role: 'global',
  domains: ['jobs'],
  modules: ['fireux-jobs'],
})
