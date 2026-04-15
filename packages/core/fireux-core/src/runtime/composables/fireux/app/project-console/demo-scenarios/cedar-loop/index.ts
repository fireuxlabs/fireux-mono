import { AppModel } from '../../../../../../models/core/app.model'
import { EcosystemModel } from '../../../../../../models/system/ecosystem.model'
import { ProjectModel } from '../../../../../../models/system/project.model'
import type { DemoProjectScenario } from '../_shared/types'

export const cedarLoopScenario = (): DemoProjectScenario => ({
  id: 'cedar-loop',
  name: 'Cedar Loop',
  label: 'Property and asset operations',
  image_url:
    'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    ...ProjectModel,
    id: 'cedar-loop',
    name: 'Cedar Loop',
    slug: 'cedar-loop',
    description: 'Read-only scenario for a property and asset operations workspace.',
    status: 'active',
    app_id: 'lease-board',
    ecosystem_id: 'cedar',
    firebase_project_id: 'cedar-loop',
  },
  projects: [
    {
      ...ProjectModel,
      id: 'cedar-loop',
      name: 'Cedar Loop',
      slug: 'cedar-loop',
      description: 'Read-only scenario for a property and asset operations workspace.',
      status: 'active',
      app_id: 'lease-board',
      ecosystem_id: 'cedar',
      firebase_project_id: 'cedar-loop',
    },
  ],
  ecosystems: [
    {
      ...EcosystemModel,
      id: 'cedar',
      project_id: 'cedar-loop',
      name: 'Cedar',
      slug: 'cedar',
      description: 'Property ecosystem for portfolio oversight, site records, and lease operations.',
      team: 'property',
      apps: ['lease-board', 'site-ledger'],
    },
  ],
  apps: [
    {
      ...AppModel,
      id: 'lease-board',
      project_id: 'cedar-loop',
      ecosystem_id: 'cedar',
      slug: 'lease-board',
      status: 'active',
      team: 'property',
      app_name: 'Lease Board',
      app_short_name: 'Lease Board',
      role: 'system',
      ecosystem: 'cedar',
    },
    {
      ...AppModel,
      id: 'site-ledger',
      project_id: 'cedar-loop',
      ecosystem_id: 'cedar',
      slug: 'site-ledger',
      status: 'active',
      team: 'property',
      app_name: 'Site Ledger',
      app_short_name: 'Site Ledger',
      role: 'ecosystem',
      ecosystem: 'cedar',
    },
  ],
})
