import type { FireuxStamps } from '../../models/utils/stamps.model'

export const ECOSYSTEM_STATUSES = ['active', 'inactive'] as const
export type EcosystemStatus = (typeof ECOSYSTEM_STATUSES)[number]

export type Ecosystem = {
  /** Supplied by the document path, not stored in the document. */
  id: string
  /** Saved AI context; public projections omit this field. */
  context?: string
  created: FireuxStamps['created']
  updated: FireuxStamps['updated']
  project_id: string
  status: EcosystemStatus
  name: string
  description?: string
  image_url?: string
  website_url?: string
}
