import type { FireuxEntity } from '../../models/utils/entity.model'

export const ECOSYSTEM_STATUSES = ['active', 'inactive'] as const
export type EcosystemStatus = (typeof ECOSYSTEM_STATUSES)[number]

export type Ecosystem = Pick<FireuxEntity, 'id' | 'context'> & {
  project_id: string
  status: EcosystemStatus
  name: string
  description?: string
  image_url?: string
  website_url?: string
  /** Older Ecosystem records may predate the stamped initializer. */
  created?: FireuxEntity['created']
  updated?: FireuxEntity['updated']
}
