import type { App } from '../../../../../models/core/app.model'
import type { Ecosystem } from '../../../../../models/system/ecosystem.model'
import type { Project } from '../../../../../models/system/project.model'

export type ReadOnlyProjectScenario = {
  id: string
  name: string
  label: string
  image_url: string
  project: Project
  projects: Project[]
  ecosystems: Ecosystem[]
  apps: App[]
}

export type ReadOnlyProjectScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'read-only'
}
