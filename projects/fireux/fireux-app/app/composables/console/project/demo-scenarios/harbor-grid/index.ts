import { AppModel } from 'fireux-core/runtime/models/core/app.model'
import { EcosystemModel } from 'fireux-core/runtime/models/system/ecosystem.model'
import { ProjectModel } from 'fireux-core/runtime/models/system/project.model'
import type { DemoProjectScenario } from '../_shared/types'

export const harborGridScenario = (): DemoProjectScenario => ({
  id: 'harbor-grid',
  name: 'Harbor Grid',
  label: 'Hospitality operations',
  image_url:
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    ...ProjectModel,
    id: 'harbor-grid',
    name: 'Harbor Grid',
    slug: 'harbor-grid',
    description: 'Read-only scenario for a hospitality operations workspace.',
    status: 'active',
  },
  projects: [
    {
      ...ProjectModel,
      id: 'harbor-grid',
      name: 'Harbor Grid',
      slug: 'harbor-grid',
      description: 'Read-only scenario for a hospitality operations workspace.',
      status: 'active',
    },
  ],
  ecosystems: [
    {
      ...EcosystemModel,
      id: 'harbor',
      project_id: 'harbor-grid',
      name: 'Harbor',
      slug: 'harbor',
      description: 'Hospitality ecosystem for service execution, procurement, and kitchen coordination.',
      team: 'hospitality',
      apps: ['line-pass', 'supply-loop'],
    },
  ],
  apps: [
    {
      ...AppModel,
      id: 'line-pass',
      project_id: 'harbor-grid',
      ecosystem_id: 'harbor',
      slug: 'line-pass',
      status: 'active',
      team: 'hospitality',
      app_name: 'Line Pass',
      app_short_name: 'Line Pass',
      role: 'system',
      ecosystem: 'harbor',
    },
    {
      ...AppModel,
      id: 'supply-loop',
      project_id: 'harbor-grid',
      ecosystem_id: 'harbor',
      slug: 'supply-loop',
      status: 'active',
      team: 'hospitality',
      app_name: 'Supply Loop',
      app_short_name: 'Supply Loop',
      role: 'ecosystem',
      ecosystem: 'harbor',
    },
  ],
})
