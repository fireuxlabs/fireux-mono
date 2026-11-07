import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

const workspaces = ['portfolio']

export default defineFireuxEcosystem({
  ecosystem: 'granite',
  projectId: 'granite',
  ecosystemId: 'granite',
  id: 'granite-app',
  context:
    'Granite supports Portfolio and Property management, with related Documents, Tasks and Compliance capabilities. Internal portfolio background remains separate from published property information.',
  name: 'Granite',
  shortName: 'Granite',
  role: 'global',
  homePath: '/home',
  seo: { staticPaths: ['/home'], noindexPaths: ['/'] },
  workspaces,
  extends: [
    'fireux-core/layer',
    ...(workspaces.includes('portfolio')
      ? [
          'fireux-properties/layer',
          'fireux-compliance/layer',
          'fireux-documents/layer',
          'fireux-tasks/layer',
        ]
      : []),
    'fireux-granite/layer',
  ],
  subscriptionCapacity: {
    portfolio: { free: 1, pro: 1, business: null },
    'portfolio.team': { free: 3, pro: 7, business: null },
  },
  domains: ['properties', 'portfolios'],
})
