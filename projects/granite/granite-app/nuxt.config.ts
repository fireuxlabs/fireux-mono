import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const workspaces = ['portfolio']

export default defineFireuxConfig({
  ecosystem: 'granite',
  projectId: 'granite',
  ecosystemId: 'granite',
  id: 'granite-app',
  context: "Granite supports Portfolio and Property management, with related Documents, Tasks and Compliance capabilities. Internal portfolio background remains separate from published property information.",
  name: 'Granite',
  shortName: 'Granite',
  role: 'global',
  workspaces,
  extends: [
    'fireux-core/layer',
    ...(workspaces.includes('portfolio') ? [
      'fireux-properties/layer',
      'fireux-compliance/layer',
      'fireux-documents/layer',
      'fireux-tasks/layer',
    ] : []),
    'fireux-granite/layer',
    'fireux-blogs/layer',
  ],
  subscriptionCapacity: {
    portfolio: { free: 1, premium: 1, business: null },
    'portfolio.team': { free: 3, premium: 7, business: null },
  },
  domains: ['properties', 'portfolios'],
})
