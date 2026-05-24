import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { metaContent } from './app/content/meta'

export default defineFireuxConfig({
  ecosystem: 'bringli',
  id: 'bringli-app',
  name: 'Bringli',
  shortName: 'Bringli',
  meta: metaContent,
  role: 'global',
  consoles: ['supplier'],
  domains: ['suppliers'],
  modules: ['fireux-suppliers', 'fireux-products'],
})
