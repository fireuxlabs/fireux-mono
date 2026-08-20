import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'bringli',
  projectId: 'bringli',
  ecosystemId: 'bringli',
  id: 'bringli-app',
  name: 'Bringli',
  shortName: 'Bringli',
  role: 'global',
  workspaces: ['supplier'],
  domains: ['suppliers'],
  modules: ['fireux-places', 'fireux-companies', 'fireux-suppliers'],
})
