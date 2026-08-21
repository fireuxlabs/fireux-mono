export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'

export type Project = {
  id: string
  status: ProjectStatus
  name: string
  description: string
  image_url: string
}
