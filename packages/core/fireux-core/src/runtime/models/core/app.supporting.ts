// FILE: packages/core/fireux-core/src/runtime/models/core/app.supporting.ts

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

/** Grouped media assets for apps. */
export type AppMedia = {
  thumbnail_url: string
  logo_url: string
  wordmark_light_url: string
  wordmark_dark_url: string
}

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
