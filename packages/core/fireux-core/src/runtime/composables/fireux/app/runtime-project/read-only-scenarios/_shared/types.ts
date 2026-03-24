import type { Project } from '../../../../../models/system/project.model'

export type ReadOnlyProjectRow = {
  id: string
  name: string
  status: string
}

export type ReadOnlyProjectEcosystemRow = {
  id: string
  name: string
  team: string
  appCount: number
}

export type ReadOnlyProjectAppRow = {
  id: string
  name: string
  shortName: string
  ecosystemId: string
  status: string
}

export type ReadOnlyProjectScenario = {
  id: string
  name: string
  label: string
  image_url: string
  project: Partial<Project> & { id: string }
  projects: ReadOnlyProjectRow[]
  ecosystems: ReadOnlyProjectEcosystemRow[]
  apps: ReadOnlyProjectAppRow[]
}

export type ReadOnlyProjectScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'read-only'
}
