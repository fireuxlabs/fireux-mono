import { AppModel } from 'fireux-core/runtime/models/core/app.model'
import { EcosystemModel } from 'fireux-core/runtime/models/system/ecosystem.model'
import { ProjectModel } from 'fireux-core/runtime/models/system/project.model'
import type { ReadOnlyProjectScenario } from '../_shared/types'

export const fireuxControlRoomScenario = (): ReadOnlyProjectScenario => ({
  id: 'fireux-control-room',
  name: 'FireUX Control Room',
  label: 'Core platform operations',
  image_url:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    ...ProjectModel,
    id: 'fireux-control-room',
    name: 'FireUX Control Room',
    slug: 'fireux-control-room',
    description: 'Read-only project scenario for core platform operations.',
    status: 'active',
  },
  projects: [
    {
      ...ProjectModel,
      id: 'fireux-control-room',
      name: 'FireUX Control Room',
      slug: 'fireux-control-room',
      description: 'Read-only project scenario for core platform operations.',
      status: 'active',
    },
  ],
  ecosystems: [
    {
      ...EcosystemModel,
      id: 'misebox',
      project_id: 'fireux-control-room',
      name: 'Misebox',
      slug: 'misebox',
      description: 'Hospitality ecosystem for kitchen and service operators.',
      team: 'hospitality',
      apps: ['misebox-app', 'niederhorn', 'la-tap-berne'],
    },
    {
      ...EcosystemModel,
      id: 'granite',
      project_id: 'fireux-control-room',
      name: 'Granite',
      slug: 'granite',
      description: 'Property ecosystem for portfolio operations.',
      team: 'property',
      apps: ['granite-app'],
    },
  ],
  apps: [
    {
      ...AppModel,
      id: 'fireux-app',
      project_id: 'fireux-control-room',
      ecosystem_id: 'fireux',
      slug: 'fireux-app',
      status: 'active',
      team: 'platform',
      app_name: 'FireUX',
      app_short_name: 'FireUX',
      role: 'system',
      ecosystem: 'fireux',
    },
    {
      ...AppModel,
      id: 'misebox-app',
      project_id: 'fireux-control-room',
      ecosystem_id: 'misebox',
      slug: 'misebox-app',
      status: 'active',
      team: 'hospitality',
      app_name: 'Misebox',
      app_short_name: 'Misebox',
      role: 'ecosystem',
      ecosystem: 'misebox',
    },
    {
      ...AppModel,
      id: 'granite-app',
      project_id: 'fireux-control-room',
      ecosystem_id: 'granite',
      slug: 'granite-app',
      status: 'active',
      team: 'property',
      app_name: 'Granite',
      app_short_name: 'Granite',
      role: 'ecosystem',
      ecosystem: 'granite',
    },
  ],
})
