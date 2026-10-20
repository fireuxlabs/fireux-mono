export type EcosystemStatus = 'active' | 'inactive' | 'archived'

export type Ecosystem = {
  id: string
  /** Internal operator background; excluded from public projections. */
  context?: string
  project_id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
}
