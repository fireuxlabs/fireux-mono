// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-template',
  name: 'FireUX Template',
  shortName: 'Template',
  brand: { owner: 'core' },
  role: 'tenant',
})
