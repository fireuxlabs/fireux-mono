import type { App } from '../../app/models/app.model.ts'
import type { EcosystemStatus } from '../../ecosystem/models/ecosystem.model.ts'

/**
 * Directory entries are transport records, not stored entities. They contain
 * only the fields needed to discover canonical App/Ecosystem records.
 */
export type AppDirectoryEntry = {
  id: string
  ecosystem_id: string
  slug: string
  status: App['status']
  app_name: string
  app_short_name: string
  role: App['role'] | ''
  tagline: string
  description: string
  short_bio: string
  detail_url: string
  derived: { user_count: number }
  media: Pick<
    App['media'],
    | 'logo_url'
    | 'thumbnail_url'
    | 'wordmark_light_url'
    | 'wordmark_dark_url'
    | 'cover_url'
  >
}

export type EcosystemDirectoryEntry = {
  id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
  detail_url: string
  app_count: number
}

export type PlatformDirectoryResponse = {
  ok: true
  generatedAt: string
  apps: AppDirectoryEntry[]
  ecosystems: EcosystemDirectoryEntry[]
}

export type CollectionResponse<T> = {
  ok: true
  count: number
  generatedAt: string
  items: T[]
}

export type DetailResponse<T> = {
  ok: true
  generatedAt: string
  item: T
}
