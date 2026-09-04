export type EcosystemStatus = 'active' | 'inactive' | 'archived'

export type Ecosystem = {
  id: string
  /** Legacy catalogue provenance, not a parent in the entity hierarchy. */
  project_id?: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
}
