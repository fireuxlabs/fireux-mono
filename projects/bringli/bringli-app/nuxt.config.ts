import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

const workspaces = ['supplier']

export default defineFireuxEcosystem({
  ecosystem: 'bringli',
  projectId: 'bringli',
  ecosystemId: 'bringli',
  id: 'bringli-app',
  context:
    'Bringli provides a Supplier Workspace for managing supplier information, catalogue records and business associations. Public business identity comes from the linked Business and Place.',
  name: 'Bringli',
  shortName: 'Bringli',
  role: 'global',
  workspaces,
  extends: [
    'fireux-core/layer',
    ...(workspaces.includes('supplier') ? ['fireux-suppliers/layer'] : []),
    'fireux-bringli/layer',

    'fireux-places/layer',
    'fireux-businesses/layer',
  ],
  subscriptionCapacity: {
    supplier: { free: 1, pro: 1, business: null },
    'supplier.team': { free: 3, pro: 7, business: null },
  },
  domains: ['suppliers'],
  modules: ['fireux-places', 'fireux-businesses'],
})
