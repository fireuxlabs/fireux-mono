import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { metaContent } from './app/content/meta'

export default defineFireuxConfig({
  ecosystem: 'cleanbox',
  id: 'cleanbox-app',
  name: 'Cleanbox',
  shortName: 'Cleanbox',
  meta: metaContent,
  role: 'global',
  consoles: [],
  domains: ['jobs'],
  modules: ['fireux-jobs', 'fireux-products', 'fireux-blogs'],
})
