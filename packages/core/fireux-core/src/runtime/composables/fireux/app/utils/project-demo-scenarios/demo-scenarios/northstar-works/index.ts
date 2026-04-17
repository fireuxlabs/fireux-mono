import { AppModel } from '../../../../../../models/core/app.model'
import { EcosystemModel } from '../../../../../../models/system/ecosystem.model'
import { ProjectModel } from '../../../../../../models/system/project.model'
import type { DemoProjectScenario } from '../_shared/types'

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
    description: 'Read-only scenario for an SEO and content operations workspace.',
    status: 'active',
    app_id: 'rank-lens',
    ecosystem_id: 'northstar',
    firebase_project_id: 'northstar-works',
  },
  projects: [
    {
      ...ProjectModel,
      id: 'northstar-works',
      name: 'Northstar Works',
      slug: 'northstar-works',
      description: 'Read-only scenario for an SEO and content operations workspace.',
      status: 'active',
      app_id: 'rank-lens',
      ecosystem_id: 'northstar',
      firebase_project_id: 'northstar-works',
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
      team: 'seo',
      apps: ['rank-lens', 'content-flow'],
    },
  ],
  apps: [
    {
      ...AppModel,
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
    },
    {
      ...AppModel,
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
    },
  ],
})
