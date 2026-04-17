import type { App } from '../../../../../../models/core/app.model'
import type { Ecosystem } from '../../../../../../models/system/ecosystem.model'
import type { Project } from '../../../../../../models/system/project.model'

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
