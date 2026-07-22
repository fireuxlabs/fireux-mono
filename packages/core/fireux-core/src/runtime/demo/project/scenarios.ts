import type { FirebaseTimestamp } from '../../../types/firebase'
import { AppModel, type App } from '../../models/core/app.model'
import {
  EcosystemModel,
  type Ecosystem,
} from '../../models/system/ecosystem.model'
import { ProjectModel, type Project } from '../../models/system/project.model'

const stamp: FirebaseTimestamp = { seconds: 1_720_000_000, nanoseconds: 0 }
const created = { at: stamp, by: 'demo', app_id: 'fireux-app' }
const updated = { at: stamp, by: 'demo' }

export type ProjectDemoScenario = {
  project: Project
  apps: App[]
  ecosystems: Ecosystem[]
}

const project: Project = {
  ...ProjectModel,
  id: 'fireux-demo-project',
  name: 'FireUX Demo Project',
  slug: 'fireux-demo-project',
  description: 'A deterministic read-only control-plane project.',
  status: 'active',
  created,
  updated,
}

export const projectDemoScenarios: ProjectDemoScenario[] = [
  {
    project,
    apps: [
      {
        ...AppModel,
        id: 'fireux-demo-app',
        project_id: project.id,
        ecosystem_id: 'fireux-demo-ecosystem',
        database_id: 'fireux-demo',
        slug: 'fireux-demo-app',
        app_name: 'FireUX Demo App',
        app_short_name: 'Demo App',
        role: 'global',
        created,
        updated,
      },
    ],
    ecosystems: [
      {
        ...EcosystemModel,
        id: 'fireux-demo-ecosystem',
        project_id: project.id,
        name: 'FireUX Demo Ecosystem',
        slug: 'fireux-demo-ecosystem',
        description: 'A deterministic read-only ecosystem relationship.',
        created,
        updated,
      },
    ],
  },
]

export const projectDemoRecords = projectDemoScenarios.map(
  (value) => value.project
)
