import type { Ecosystem, EcosystemStatus } from '../models/system/ecosystem.model'
import type { ProjectStatus, ProjectType } from '../models/system/project.model'

export type FireuxConsoleProject = {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  status: ProjectStatus
  project_type: ProjectType
  source_url: string
  console_endpoint_url: string
  app_id: string
  ecosystem_id: string
  firebase_project_id: string
}

export type FireuxConsoleEcosystem = {
  id: string
  project_id: string
  name: string
  slug: string
  description: string
  image_url: string
  source_url: string
  status: EcosystemStatus
  team: string
  apps: string[]
  created?: Ecosystem['created']
  updated?: Ecosystem['updated']
}

export type FireuxConsoleAppRef = {
  id: string
  url: string
}

export type FireuxConsolePayload = {
  ok: true
  project: FireuxConsoleProject
  ecosystem: FireuxConsoleEcosystem | null
  apps: FireuxConsoleAppRef[]
}
