import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-template',
  name: 'FireUX Template',
  shortName: 'Template',
  role: 'tenant',
  modules: ['fireux-products'],
})
