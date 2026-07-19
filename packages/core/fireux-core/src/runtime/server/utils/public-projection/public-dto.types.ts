import type { AppStatus } from '../../../models/core/app.model'
import type {
  AppDerived,
  AppMedia,
  AppRole,
  AppSocialLinks,
} from '../../../models/core/supporting/app'
import type { FireuxCreatedStamp } from '../../../models/core/meta.model'

export type PublicSeoDto = {
  title: string
  description: string
  path: string
  image?: string
  updatedAt: string
  isPublic: boolean
}

export type PublicUserDto = PublicSeoDto & {
  id: string
  handle: string
  displayName: string
  avatar: string
  apps: string[]
  profiles: string[]
}

/**
 * Explicit allowlist for public App transport.
 *
 * App storage also contains build, moderation, and join-request fields. Those
 * fields must never reach a public response through object spreading.
 * `admin_ids` and the creator stamp are intentional public relationships used
 * by the public App profile. Project ownership and ambiguous legacy team data
 * remain private control-plane concerns.
 */
export type PublicAppDto = {
  id: string
  ecosystem_id: string
  slug: string
  status: AppStatus | ''
  app_name: string
  app_short_name: string
  role: AppRole | ''
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: AppSocialLinks
  derived: AppDerived
  media: AppMedia
  admin_ids: string[]
  created?: FireuxCreatedStamp
}

export type PublicCollectionResponse<T> = {
  ok: true
  count: number
  generatedAt: string
  items: T[]
}

export type PublicDetailResponse<T> = {
  ok: true
  generatedAt: string
  item: T
}
