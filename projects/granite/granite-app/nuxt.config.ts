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
  subscriptionCapacity: {
    portfolio: { free: 1, premium: 1, business: null },
    'portfolio.team': { free: 3, premium: 7, business: null },
  },
  domains: ['properties', 'portfolios'],
})
