import type { FireuxStamps } from '../../models/utils/stamps.model'

export const APP_ROLES = ['global', 'tenant', 'standalone'] as const
export type AppRole = (typeof APP_ROLES)[number]

export const APP_STATUSES = ['active', 'inactive'] as const
export type AppStatus = (typeof APP_STATUSES)[number]

export type App = {
  /** Supplied by the document path, not stored in the document. */
  id: string
  /** Saved AI context; public projections omit this field. */
  context?: string
  created: FireuxStamps['created']
  updated: FireuxStamps['updated']
  ecosystem_id: string
  role: AppRole
  status: AppStatus
  name: string
  short_name?: string
  tagline?: string
  description?: string
  social_links?: {
    website?: string
    twitter?: string
    github?: string
    linkedin?: string
    instagram?: string
    facebook?: string
    youtube?: string
    email?: string
  }
  media?: {
    thumbnail_url?: string
    logo_url?: string
    wordmark_light_url?: string
    wordmark_dark_url?: string
    cover_url?: string
  }
}
