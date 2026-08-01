// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'bringli',
  projectId: 'bringli',
  ecosystemId: 'bringli',
  id: 'bringli-app',
  name: 'Bringli',
  shortName: 'Bringli',
  brand: { owner: 'app', status: 'provisional' },
  role: 'global',
  consoles: ['supplier'],
  domains: ['suppliers'],
  modules: ['fireux-suppliers'],
})
