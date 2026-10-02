import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const workspaces = ['supplier']

export default defineFireuxConfig({
  ecosystem: 'bringli',
  projectId: 'bringli',
  ecosystemId: 'bringli',
  id: 'bringli-app',
  name: 'Bringli',
  shortName: 'Bringli',
  role: 'global',
  workspaces,
  extends: [
    'fireux-core/layer',
    ...(workspaces.includes('supplier') ? ['fireux-suppliers/layer'] : []),
    'fireux-bringli/layer',
    'fireux-blogs/layer',
    'fireux-places/layer',
    'fireux-companies/layer',
  ],
  subscriptionCapacity: {
    supplier: { free: 1, premium: 1, business: null },
    'supplier.team': { free: 3, premium: 7, business: null },
  },
  domains: ['suppliers'],
  modules: ['fireux-places', 'fireux-companies'],
})
