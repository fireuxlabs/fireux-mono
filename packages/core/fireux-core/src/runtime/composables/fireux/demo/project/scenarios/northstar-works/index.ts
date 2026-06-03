import { EcosystemModel } from 'fireux-core/runtime/models/system/ecosystem.model'
import { ProjectModel } from 'fireux-core/runtime/models/system/project.model'
import type { DemoProjectScenario } from '../_shared/types'
import { createDemoApp } from '../_shared/demo-app'

export const northstarWorksScenario = (): DemoProjectScenario => ({
  id: 'northstar-works',
  name: 'Northstar Works',
  label: 'SEO and growth operations',
  image_url:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    ...ProjectModel,
    id: 'northstar-works',
    name: 'Northstar Works',
    slug: 'northstar-works',
    description: 'SEO and growth operations',
    image_url:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&h=320&q=80',
    status: 'active',
    app_scope_state: 'dedicated_app',
    app_scope_app_id: 'rank-lens',
    project_type: 'ecosystem_app',
    app_id: 'rank-lens',
    ecosystem_id: 'northstar',
    firebase_project_id: 'northstar-works',
    owner_user_id: 'demo-user',
    operator_ids: ['demo-user'],
    team_ids: ['demo-user'],
  },
  projects: [
    {
      ...ProjectModel,
      id: 'northstar-works',
      name: 'Northstar Works',
      slug: 'northstar-works',
      description: 'SEO and growth operations',
      image_url:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&h=320&q=80',
      status: 'active',
      app_scope_state: 'dedicated_app',
      app_scope_app_id: 'rank-lens',
      project_type: 'ecosystem_app',
      app_id: 'rank-lens',
      ecosystem_id: 'northstar',
      firebase_project_id: 'northstar-works',
      owner_user_id: 'demo-user',
      operator_ids: ['demo-user'],
      team_ids: ['demo-user'],
    },
  ],
  ecosystems: [
    {
      ...EcosystemModel,
      id: 'northstar',
      project_id: 'northstar-works',
      name: 'Northstar',
      slug: 'northstar',
      description: 'Search visibility ecosystem for audits, keyword planning, and content delivery.',
      image_url:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=320&h=320&q=80',
      team: 'seo',
      apps: ['rank-lens', 'content-flow'],
    },
  ],
  apps: [
    createDemoApp({
      id: 'rank-lens',
      project_id: 'northstar-works',
      ecosystem_id: 'northstar',
      slug: 'rank-lens',
      status: 'active',
      team: 'seo',
      app_name: 'Rank Lens',
      app_short_name: 'Rank Lens',
      role: 'system',
      ecosystem: 'northstar',
      thumbnail_url:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=160&h=160&q=80',
    }),
    createDemoApp({
      id: 'content-flow',
      project_id: 'northstar-works',
      ecosystem_id: 'northstar',
      slug: 'content-flow',
      status: 'active',
      team: 'seo',
      app_name: 'Content Flow',
      app_short_name: 'Content Flow',
      role: 'ecosystem',
      ecosystem: 'northstar',
      thumbnail_url:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=160&h=160&q=80',
    }),
    createDemoApp({
      id: 'signal-scout',
      project_id: 'northstar-works',
      ecosystem_id: '',
      slug: 'signal-scout',
      status: 'active',
      team: 'seo',
      app_name: 'Signal Scout',
      app_short_name: 'Signal Scout',
      role: 'standalone',
      ecosystem: '',
      thumbnail_url:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=160&h=160&q=80',
    }),
  ],
})
