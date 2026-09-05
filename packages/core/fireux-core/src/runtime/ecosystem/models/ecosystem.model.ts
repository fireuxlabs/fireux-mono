export type EcosystemStatus = 'active' | 'inactive' | 'archived'

export type Ecosystem = {
  id: string
  project_id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
}
