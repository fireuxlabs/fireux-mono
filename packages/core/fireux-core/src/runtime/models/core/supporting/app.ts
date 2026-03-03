// FILE: packages/core/fireux-core/src/runtime/models/core/supporting/app.ts

/**
 * App role defines scope and permissions.
 */
export type AppRole = 'global' | 'tenant' | 'ecosystem' | 'system'

/**
 * Social links grouped for safety and extensibility.
 * Empty string means unset.
 */
export interface AppSocialLinks {
  website: string
  twitter: string
  github: string
  linkedin: string
  instagram: string
  facebook: string
  youtube: string
  email: string
}

export type AppMedia = {
  thumbnail_url: string
  logo_url: string
  wordmark_light_url: string
  wordmark_dark_url: string
  cover_url: string
}

export type AppDerived = {
  user_count: number
}
