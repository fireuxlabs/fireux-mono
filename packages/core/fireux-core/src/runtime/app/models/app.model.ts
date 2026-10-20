import type { FirebaseTimestamp } from '../../../types/firebase'

export type App = {
  id: string
  /** Internal operator background; excluded from public projections. */
  context?: string
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
  created: {
    at: FirebaseTimestamp
    by?: string
  }
  updated: {
    at: FirebaseTimestamp
    by?: string
  }
}
