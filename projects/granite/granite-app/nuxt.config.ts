import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'granite',
  projectId: 'granite',
  ecosystemId: 'granite',
  id: 'granite-app',
  name: 'Granite',
  shortName: 'Granite',
  role: 'global',
  workspaces: ['portfolio'],
  domains: ['properties', 'portfolios'],
})
