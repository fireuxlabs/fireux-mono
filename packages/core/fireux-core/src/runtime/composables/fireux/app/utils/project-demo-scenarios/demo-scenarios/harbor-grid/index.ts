import { EcosystemModel } from 'fireux-core/runtime/models/system/ecosystem.model'
import { ProjectModel } from 'fireux-core/runtime/models/system/project.model'
import type { DemoProjectScenario } from '../_shared/types'
import { createDemoApp } from '../_shared/demo-app'

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
    description: 'Hospitality operations',
    image_url:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=320&h=320&q=80',
    status: 'active',
    app_scope_state: 'dedicated_app',
    app_scope_app_id: 'line-pass',
    project_type: 'ecosystem_app',
    app_id: 'line-pass',
    ecosystem_id: 'harbor',
    firebase_project_id: 'harbor-grid',
    owner_user_id: 'demo-user',
    team_ids: ['demo-user'],
  },
  projects: [
    {
      ...ProjectModel,
      id: 'harbor-grid',
      name: 'Harbor Grid',
      slug: 'harbor-grid',
      description: 'Hospitality operations',
      image_url:
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=320&h=320&q=80',
      status: 'active',
      app_scope_state: 'dedicated_app',
      app_scope_app_id: 'line-pass',
      project_type: 'ecosystem_app',
      app_id: 'line-pass',
      ecosystem_id: 'harbor',
      firebase_project_id: 'harbor-grid',
      owner_user_id: 'demo-user',
      team_ids: ['demo-user'],
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
    createDemoApp({
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
      thumbnail_url:
        'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=160&h=160&q=80',
    }),
    createDemoApp({
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
      thumbnail_url:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=160&h=160&q=80',
    }),
  ],
})
