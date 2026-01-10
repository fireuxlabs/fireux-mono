// FILE: packages/core/fireux-core/src/runtime/models/core/app.supporting.ts

import type { FirebaseTimestamp } from '../../../types/firebase'

export type AppRole = 'global' | 'tenant' | 'sandbox'
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

/**
 * Standard metadata for all canon docs.
 * (Kept in supporting so models can import without repeating)
 */
export interface FireuxMeta {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  creator_id: string
}
