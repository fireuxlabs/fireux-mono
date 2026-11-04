import type { FireuxEntity } from '../../models/utils/entity.model'

export const APP_ROLES = ['global', 'tenant', 'standalone'] as const
export type AppRole = (typeof APP_ROLES)[number]

export const APP_STATUSES = ['active', 'inactive'] as const
export type AppStatus = (typeof APP_STATUSES)[number]

export type App = FireuxEntity & {
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

/** Public directory/detail identity; excludes private context and audit. */
export type AppPublicSummary = Pick<
  App,
  | 'id'
  | 'ecosystem_id'
  | 'role'
  | 'status'
  | 'name'
  | 'short_name'
  | 'tagline'
  | 'description'
  | 'social_links'
  | 'media'
>
