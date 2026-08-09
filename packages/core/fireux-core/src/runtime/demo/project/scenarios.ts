import { AppDefaults, type App } from '../../models/core/app.model'
import {
  EcosystemDefaults,
  type Ecosystem,
} from '../../models/core/ecosystem.model'
import type { Project } from '../../models/system/project.model'
import {
  fireuxDemoProject,
  projectDemoCreated,
  projectDemoUpdated,
} from './targets'

export type ProjectDemoScenario = {
  appId: string
  project: Project
  apps: App[]
  ecosystems: Ecosystem[]
}

export const projectDemoScenarios: ProjectDemoScenario[] = [
  {
    appId: 'fireux-app',
    project: fireuxDemoProject,
    apps: [
      {
        ...AppDefaults,
        id: 'fireux-demo-app',
        project_id: fireuxDemoProject.id,
        ecosystem_id: 'fireux-demo-ecosystem',
        name: 'FireUX Demo App',
        short_name: 'Demo App',
        role: 'global',
        created: projectDemoCreated,
        updated: projectDemoUpdated,
      },
    ],
    ecosystems: [
      {
        ...EcosystemDefaults,
        id: 'fireux-demo-ecosystem',
        project_id: fireuxDemoProject.id,
        name: 'FireUX Demo Ecosystem',
        description: 'A deterministic read-only ecosystem relationship.',
        created: projectDemoCreated,
        updated: projectDemoUpdated,
      },
    ],
  },
]

for (const scenario of projectDemoScenarios) {
  const appId = String(scenario.appId || '').trim()
  const projectId = String(scenario.project.id || '').trim()
  const appIds = new Set<string>()
  const ecosystemIds = new Set(
    scenario.ecosystems.map((ecosystem) => String(ecosystem.id || '').trim())
  )

  if (
    !appId ||
    !projectId ||
    ecosystemIds.has('') ||
    scenario.project.created.app_id !== appId
  ) {
    throw new Error(
      'Every Project Demo scenario requires stable root identities.'
    )
  }

  for (const ecosystem of scenario.ecosystems) {
    if (ecosystem.project_id !== projectId) {
      throw new Error(
        `Project Demo ${projectId}/${ecosystem.id} has an invalid Ecosystem parent.`
      )
    }
  }

  for (const app of scenario.apps) {
    const childAppId = String(app.id || '').trim()
    const childEcosystemId = String(app.ecosystem_id || '').trim()
    if (
      !childAppId ||
      appIds.has(childAppId) ||
      app.project_id !== projectId ||
      !childEcosystemId ||
      !ecosystemIds.has(childEcosystemId) ||
      'operator_ids' in app ||
      'team_ids' in app ||
      'join_requests' in app
    ) {
      throw new Error(
        `Project Demo ${projectId}/${childAppId || '(missing-app)'} has an invalid control-plane relationship.`
      )
    }
    appIds.add(childAppId)
  }
}

export const projectDemoRecords = projectDemoScenarios.map(
  (value) => value.project
)
