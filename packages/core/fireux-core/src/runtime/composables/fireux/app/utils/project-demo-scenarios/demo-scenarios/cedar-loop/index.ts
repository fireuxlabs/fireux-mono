import { EcosystemModel } from 'fireux-core/runtime/models/system/ecosystem.model'
import { ProjectModel } from 'fireux-core/runtime/models/system/project.model'
import type { DemoProjectScenario } from '../_shared/types'
import { createDemoApp } from '../_shared/demo-app'

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
    description: 'Property and asset operations',
    image_url:
      'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=320&h=320&q=80',
    status: 'active',
    app_scope_state: 'dedicated_app',
    app_scope_app_id: 'lease-board',
    project_type: 'ecosystem_app',
    app_id: 'lease-board',
    ecosystem_id: 'cedar',
    firebase_project_id: 'cedar-loop',
    owner_user_id: 'demo-user',
    team_ids: ['demo-user'],
  },
  projects: [
    {
      ...ProjectModel,
      id: 'cedar-loop',
      name: 'Cedar Loop',
      slug: 'cedar-loop',
      description: 'Property and asset operations',
      image_url:
        'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=320&h=320&q=80',
      status: 'active',
      app_scope_state: 'dedicated_app',
      app_scope_app_id: 'lease-board',
      project_type: 'ecosystem_app',
      app_id: 'lease-board',
      ecosystem_id: 'cedar',
      firebase_project_id: 'cedar-loop',
      owner_user_id: 'demo-user',
      team_ids: ['demo-user'],
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
    createDemoApp({
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
      thumbnail_url:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=160&h=160&q=80',
    }),
    createDemoApp({
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
      thumbnail_url:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&h=160&q=80',
    }),
  ],
})
