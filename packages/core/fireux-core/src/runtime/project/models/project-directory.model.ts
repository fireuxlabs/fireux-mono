import type { ProjectStatus } from './project.model.ts'

export type ProjectDirectoryEntry = {
  id: string
  name: string
  description: string
  image_url: string
  status: ProjectStatus
}

export type ProjectDirectoryPage = {
  projects: ProjectDirectoryEntry[]
}
