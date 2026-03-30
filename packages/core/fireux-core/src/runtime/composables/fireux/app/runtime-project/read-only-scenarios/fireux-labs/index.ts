import { AppModel } from '../../../../../../models/core/app.model'
import { EcosystemModel } from '../../../../../../models/system/ecosystem.model'
import { ProjectModel } from '../../../../../../models/system/project.model'
import type { ReadOnlyProjectScenario } from '../_shared/types'

export const fireuxLabsScenario = (): ReadOnlyProjectScenario => ({
  id: 'fireux-labs',
  name: 'FireUX Labs',
  label: 'Experimental project stack',
  image_url:
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    ...ProjectModel,
    id: 'fireux-labs',
    name: 'FireUX Labs',
    slug: 'fireux-labs',
    description: 'Read-only scenario for experimental project stacks.',
    status: 'active',
  },
  projects: [
    {
      ...ProjectModel,
      id: 'fireux-labs',
      name: 'FireUX Labs',
      slug: 'fireux-labs',
      description: 'Read-only scenario for experimental project stacks.',
      status: 'active',
    },
  ],
  ecosystems: [
    {
      ...EcosystemModel,
      id: 'prototype',
      project_id: 'fireux-labs',
      name: 'Prototype',
      slug: 'prototype',
      description: 'Experimental staging ecosystem.',
      team: 'labs',
      apps: ['labs-console', 'prototype-app'],
    },
  ],
  apps: [
    {
      ...AppModel,
      id: 'labs-console',
      project_id: 'fireux-labs',
      ecosystem_id: 'prototype',
      slug: 'labs-console',
      status: 'active',
      team: 'labs',
      app_name: 'Labs Console',
      app_short_name: 'Labs',
      role: 'system',
      ecosystem: 'prototype',
    },
    {
      ...AppModel,
      id: 'prototype-app',
      project_id: 'fireux-labs',
      ecosystem_id: 'prototype',
      slug: 'prototype-app',
      status: 'draft',
      team: 'labs',
      app_name: 'Prototype App',
      app_short_name: 'Prototype',
      role: 'ecosystem',
      ecosystem: 'prototype',
    },
  ],
})
