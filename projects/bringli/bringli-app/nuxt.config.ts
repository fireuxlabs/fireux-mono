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
  subscriptionCapacity: {
    supplier: { free: 1, premium: 1, business: null },
    'supplier.team': { free: 3, premium: 7, business: null },
  },
  domains: ['suppliers'],
  modules: ['fireux-places', 'fireux-companies'],
})
