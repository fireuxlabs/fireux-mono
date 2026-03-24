import type { ReadOnlyProjectScenario } from '../_shared/types'

export const fireuxObservatoryScenario = (): ReadOnlyProjectScenario => ({
  id: 'fireux-observatory',
  name: 'FireUX Observatory',
  label: 'Insights and telemetry',
  image_url:
    'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    id: 'fireux-observatory',
    name: 'FireUX Observatory',
    slug: 'fireux-observatory',
    description: 'Read-only scenario for analytics and observability.',
    status: 'active',
  },
  projects: [
    { id: 'fireux-observatory', name: 'FireUX Observatory', status: 'active' },
  ],
  ecosystems: [
    { id: 'insights', name: 'Insights', team: 'observability', appCount: 1 },
  ],
  apps: [
    { id: 'observatory-app', name: 'Observatory', shortName: 'Observatory', ecosystemId: 'insights', status: 'active' },
  ],
})
