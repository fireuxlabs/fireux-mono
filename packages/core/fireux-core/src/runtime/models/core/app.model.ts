// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
import type { FirestoreTimestampOrString } from '../../../types/firebase'

export type AppRole = 'global' | 'tenant' | 'sandbox'
type Ts = FirestoreTimestampOrString

export type AppSocialPlatform =
  | 'website'
  | 'email'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'instagram'
  | 'facebook'
  | 'youtube'

export type AppSocialLinks = Record<AppSocialPlatform, string>

export const APP_SOCIAL_PLATFORMS: ReadonlyArray<AppSocialPlatform> = [
  'website',
  'email',
  'twitter',
  'linkedin',
  'github',
  'instagram',
  'facebook',
  'youtube',
] as const

export function createEmptyAppSocialLinks(): AppSocialLinks {
  return {
    website: '',
    email: '',
    twitter: '',
    linkedin: '',
    github: '',
    instagram: '',
    facebook: '',
    youtube: '',
  }
}

/** Core Firestore App document */
export interface App {
  id: string

  // Display
  app_name: string
  app_short_name: string

  // Scope + lineage
  role: AppRole
  ecosystem: string

  // Governance
  join_requests: string[]
  admin_ids: string[]
  creator_id: string
  created_by: string

  // Optional metadata
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: AppSocialLinks

  // Derived counts
  user_count: number

  // System metadata
  created_at: Ts
  updated_at: Ts

  // Brand/media URLs (flat)
  /** Used on avatar/thumbnail surfaces. Empty string means "not set". */
  thumbnail_url: string
  /** @deprecated legacy field. Keep as empty string; use thumbnail_url. */
  avatar_url: string
  /** Used on logo surfaces. Empty string means "not set". */
  logo_url: string
  // Canon wordmark variants
  /** Used on light surfaces. Empty string means "not set". */
  wordmark_light_url: string
  /** Used on dark surfaces. Empty string means "not set". */
  wordmark_dark_url: string
}
