import type { App } from 'fireux-core/runtime/models/core/app.model'
import type { Ecosystem } from 'fireux-core/runtime/models/system/ecosystem.model'
import type { Project } from 'fireux-core/runtime/models/system/project.model'

export type DemoProjectScenario = {
  id: string
  name: string
  label: string
  image_url: string
  project: Project
  projects: Project[]
  ecosystems: Ecosystem[]
  apps: App[]
}

export type DemoProjectScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'demo'
}
