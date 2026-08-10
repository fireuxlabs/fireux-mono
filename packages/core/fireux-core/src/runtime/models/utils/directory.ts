import type {
  AppAssets,
  AppDerived,
  AppRole,
  AppStatus,
} from '../core/app.model'
import type { EcosystemStatus } from '../core/ecosystem.model'

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
  assets: AppAssets
}

export type EcosystemDirectoryEntry = {
  id: string
  status: EcosystemStatus
  name: string
  description: string
  assets: { image: string }
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
