import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import type { Project } from '../models/project.model.ts'
import { fireuxDemoProject } from './targets'

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
        id: 'fireux-demo-app',
        ecosystem_id: 'fireux-demo-ecosystem',
        name: 'FireUX Demo App',
        short_name: 'Demo App',
        role: 'global',
        status: 'active',
        description: 'A deterministic read-only App relationship.',
        media: {
          thumbnail_url: '',
          logo_url: '',
          wordmark_light_url: '',
          wordmark_dark_url: '',
          cover_url: '',
        },
        self_join_enabled: false,
        created: { at: { seconds: 0, nanoseconds: 0 }, by: 'demo' },
        updated: { at: { seconds: 0, nanoseconds: 0 }, by: 'demo' },
      },
    ],
    ecosystems: [
      {
        id: 'fireux-demo-ecosystem',
        project_id: fireuxDemoProject.id,
        name: 'FireUX Demo Ecosystem',
        description: 'A deterministic read-only ecosystem relationship.',
        status: 'active',
        image_url: '',
        website_url: '',
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

  if (!appId || !projectId || ecosystemIds.has('')) {
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
