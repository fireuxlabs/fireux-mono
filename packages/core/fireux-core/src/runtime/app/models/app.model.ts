import type { FireuxEntity } from '../../models/utils/entity.model'

export type App = FireuxEntity & {
  ecosystem_id: string
  role: 'global' | 'tenant' | 'standalone'
  status: 'active' | 'inactive' | 'archived'
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
  self_join_enabled?: boolean
}

/** Public directory/detail identity; excludes private context, policy and audit. */
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
