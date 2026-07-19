import type { AppStatus } from '../app.model'
import type { EcosystemStatus } from '../../system/ecosystem.model'
import type { AppDerived, AppMedia, AppRole } from './app'
import type { Ref } from 'vue'

/**
 * Public directory projections are transport records, not stored entities.
 * They contain only the fields needed to discover canonical App/Ecosystem
 * records and deliberately exclude access, moderation, build, and inverse
 * relationship state.
 */
export type AppDirectoryEntry = {
  id: string
  ecosystem_id: string
  slug: string
  status: AppStatus
  app_name: string
  app_short_name: string
  role: AppRole | ''
  tagline: string
  description: string
  short_bio: string
  detail_url: string
  derived: Pick<AppDerived, 'user_count'>
  media: Pick<
    AppMedia,
    | 'logo_url'
    | 'thumbnail_url'
    | 'wordmark_light_url'
    | 'wordmark_dark_url'
    | 'cover_url'
  >
}

export type EcosystemDirectoryEntry = {
  id: string
  slug: string
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

export type DirectoryOutcome = 'pending' | 'error' | 'empty' | 'ready'

export type AppDirectoryController = {
  apps: Ref<AppDirectoryEntry[]>
  count: Ref<number>
  pending: Ref<boolean>
  error: Ref<unknown>
  outcome: Ref<DirectoryOutcome>
  source: 'ecosystem' | 'platform'
  refresh?: () => Promise<unknown>
}

export type EcosystemDirectoryController = {
  ecosystems: Ref<EcosystemDirectoryEntry[]>
  count: Ref<number>
  pending: Ref<boolean>
  error: Ref<unknown>
  outcome: Ref<DirectoryOutcome>
  source: 'platform'
  refresh?: () => Promise<unknown>
}
