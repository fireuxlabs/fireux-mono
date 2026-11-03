import type { FireuxEntity } from '../../models/utils/entity.model'

export type EcosystemStatus = 'active' | 'inactive' | 'archived'

export type Ecosystem = FireuxEntity & {
  project_id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url?: string
}

/** Public Ecosystem identity; excludes private context and audit provenance. */
export type EcosystemPublicSummary = Pick<
  Ecosystem,
  | 'id'
  | 'project_id'
  | 'status'
  | 'name'
  | 'description'
  | 'image_url'
  | 'website_url'
>
