import type { App } from 'fireux-core/runtime/models/core/app.model'
import type { Ecosystem } from 'fireux-core/runtime/models/system/ecosystem.model'
import type { Project } from 'fireux-core/runtime/models/system/project.model'

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
