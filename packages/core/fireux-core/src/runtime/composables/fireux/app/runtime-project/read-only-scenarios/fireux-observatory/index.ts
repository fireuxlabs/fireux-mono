import { AppModel } from '../../../../../../models/core/app.model'
import { EcosystemModel } from '../../../../../../models/system/ecosystem.model'
import { ProjectModel } from '../../../../../../models/system/project.model'
import type { ReadOnlyProjectScenario } from '../_shared/types'

export const fireuxObservatoryScenario = (): ReadOnlyProjectScenario => ({
  id: 'fireux-observatory',
  name: 'FireUX Observatory',
  label: 'Insights and telemetry',
  image_url:
    'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    ...ProjectModel,
    id: 'fireux-observatory',
    name: 'FireUX Observatory',
    slug: 'fireux-observatory',
    description: 'Read-only scenario for analytics and observability.',
    status: 'active',
  },
  projects: [
    {
      ...ProjectModel,
      id: 'fireux-observatory',
      name: 'FireUX Observatory',
      slug: 'fireux-observatory',
      description: 'Read-only scenario for analytics and observability.',
      status: 'active',
    },
  ],
  ecosystems: [
    {
      ...EcosystemModel,
      id: 'insights',
      project_id: 'fireux-observatory',
      name: 'Insights',
      slug: 'insights',
      description: 'Analytics and telemetry ecosystem.',
      team: 'observability',
      apps: ['observatory-app'],
    },
  ],
  apps: [
    {
      ...AppModel,
      id: 'observatory-app',
      project_id: 'fireux-observatory',
      ecosystem_id: 'insights',
      slug: 'observatory-app',
      status: 'active',
      team: 'observability',
      app_name: 'Observatory',
      app_short_name: 'Observatory',
      role: 'ecosystem',
      ecosystem: 'insights',
    },
  ],
})
