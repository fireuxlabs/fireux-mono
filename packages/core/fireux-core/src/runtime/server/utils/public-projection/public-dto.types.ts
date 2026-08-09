// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: transport domain fields beside canonical User identity.
// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: keep creator principals out of public App transport.
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: define the minimal public identity and App-admin people transport.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: expose biography only on full public User transport.
import type { AppStatus } from '../../../models/core/app.model'
import type { EcosystemStatus } from '../../../models/core/ecosystem.model'
import type {
  AppDerived,
  AppMedia,
  AppRole,
  AppSocialLinks,
} from '../../../models/core/app.model'
import type { AppUserAccessTier } from '../../../utils/app-user-access'
import type { FirebaseTimestamp } from '../../../../types/firebase'

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
  bio: string
  avatar: string
}

export type PublicUserIdentityDto = {
  id: string
  display_name: string
  avatar: string
  handle: string
}

export type PublicProfileUserDto = PublicUserIdentityDto

export type AppAdminMemberDto = {
  id: string
  role: 'admin' | 'user'
  user: PublicUserIdentityDto | null
}

export type AppAdminJoinRequestDto = {
  id: string
  user: PublicUserIdentityDto | null
}

export type AppAdminPeopleResponse = {
  ok: true
  appId: string
  members: AppAdminMemberDto[]
  joinRequests: AppAdminJoinRequestDto[]
  truncated: boolean
}

export type CurrentAppMembershipDto = {
  id: string
  role: 'admin' | 'user'
  is_premium: boolean
  access_tier: AppUserAccessTier
  has_premium_access: boolean
  console_enabled: boolean
  onboarding_status: 'pending' | 'completed' | 'skipped'
  profiles: string[]
}

/** Authenticated current-App context adds only the policy needed by its caller. */
export type CurrentAppDto = PublicAppDto & {
  self_join_enabled: boolean
}

export type CurrentAppContextResponse = {
  ok: true
  appId: string
  app: CurrentAppDto | null
  membership: CurrentAppMembershipDto | null
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
 * App membership and role identities remain private AppUser concerns. Project
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
  created?: { at: FirebaseTimestamp }
}

/** Explicit allowlist for one published Ecosystem. */
export type PublicEcosystemDto = {
  id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
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
