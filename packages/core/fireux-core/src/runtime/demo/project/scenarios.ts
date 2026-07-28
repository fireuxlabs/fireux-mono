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

for (const scenario of projectDemoScenarios) {
  const projectId = String(scenario.project.id || '').trim()
  const appIds = new Set<string>()
  const ecosystemIds = new Set(
    scenario.ecosystems.map((ecosystem) => String(ecosystem.id || '').trim())
  )

  if (!projectId || ecosystemIds.has('')) {
    throw new Error('Every Project Demo scenario requires stable root identities.')
  }

  for (const ecosystem of scenario.ecosystems) {
    if (ecosystem.project_id !== projectId) {
      throw new Error(
        `Project Demo ${projectId}/${ecosystem.id} has an invalid Ecosystem parent.`
      )
    }
  }

  for (const app of scenario.apps) {
    const appId = String(app.id || '').trim()
    if (
      !appId ||
      appIds.has(appId) ||
      app.project_id !== projectId ||
      !ecosystemIds.has(app.ecosystem_id) ||
      'operator_ids' in app ||
      'team_ids' in app ||
      'join_requests' in app
    ) {
      throw new Error(
        `Project Demo ${projectId}/${appId || '(missing-app)'} has an invalid control-plane relationship.`
      )
    }
    appIds.add(appId)
  }
}

export const projectDemoRecords = projectDemoScenarios.map(
  (value) => value.project
)
