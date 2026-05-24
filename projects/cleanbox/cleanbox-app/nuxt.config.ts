import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'cleanbox',
  id: 'cleanbox-app',
  name: 'Cleanbox',
  shortName: 'Cleanbox',
  role: 'global',
  consoles: [],
  domains: ['jobs'],
  modules: ['fireux-jobs', 'fireux-products', 'fireux-blogs'],
})
