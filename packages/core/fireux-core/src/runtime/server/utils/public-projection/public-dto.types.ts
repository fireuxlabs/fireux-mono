// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: transport domain fields beside canonical User identity.
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

export type PublicProfileUserDto = {
  id: string
  display_name: string
  avatar: string
  handle: string
}

/**
 * Public profile transport keeps canonical User identity beside, never inside,
 * the domain profile record. The profile payload is field-allowlisted by kind.
 */
export type PublicProfileDto<
  TProfile extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string
  kind: 'agent' | 'chef' | 'driver' | 'professional'
  profile: TProfile
  user: PublicProfileUserDto
}

/**
 * Explicit allowlist for public App transport.
 *
 * App storage also contains build, moderation, and join-request fields. Those
 * fields must never reach a public response through object spreading.
 * App membership and role identities remain private UserApp concerns. Project
 * ownership and ambiguous legacy team data remain private control-plane data.
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
