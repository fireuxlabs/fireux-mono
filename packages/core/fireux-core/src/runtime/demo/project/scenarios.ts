import { AppModel, type App } from '../../models/core/app.model'
import {
  EcosystemModel,
  type Ecosystem,
} from '../../models/system/ecosystem.model'
import type { Project } from '../../models/system/project.model'
import {
  fireuxDemoProject,
  projectDemoCreated,
  projectDemoUpdated,
} from './targets'

export type ProjectDemoScenario = {
  project: Project
  apps: App[]
  ecosystems: Ecosystem[]
}

export const projectDemoScenarios: ProjectDemoScenario[] = [
  {
    project: fireuxDemoProject,
    apps: [
      {
        ...AppModel,
        id: 'fireux-demo-app',
        project_id: fireuxDemoProject.id,
        ecosystem_id: 'fireux-demo-ecosystem',
        database_id: 'fireux-demo',
        slug: 'fireux-demo-app',
        app_name: 'FireUX Demo App',
        app_short_name: 'Demo App',
        role: 'global',
        created: projectDemoCreated,
        updated: projectDemoUpdated,
      },
    ],
    ecosystems: [
      {
        ...EcosystemModel,
        id: 'fireux-demo-ecosystem',
        project_id: fireuxDemoProject.id,
        name: 'FireUX Demo Ecosystem',
        slug: 'fireux-demo-ecosystem',
        description: 'A deterministic read-only ecosystem relationship.',
        created: projectDemoCreated,
        updated: projectDemoUpdated,
      },
    ],
  },
]

export const projectDemoRecords = projectDemoScenarios.map(
  (value) => value.project
)
