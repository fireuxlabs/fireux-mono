// FILE: packages/core/fireux-core/src/runtime/models/core/supporting/app.ts
// Concurrent edit — 2026-07-20 15:59 CEST — Repo Efficiency Pass 1 of 6: align App repo console-family types with the security contract.

/**
 * App role defines scope and permissions.
 */
export type AppRole = 'global' | 'tenant' | 'standalone' | 'ecosystem' | 'system'

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

export const APP_CONSOLE_FAMILIES = [
  'blank',
  'kitchen',
  'portfolio',
  'project',
  'property',
  'supplier',
] as const

export type AppConsoleFamily = (typeof APP_CONSOLE_FAMILIES)[number]

export type AppRepoMetadata = {
  key: string
  workspace: string
  launch_order: number
  console_families: AppConsoleFamily[]
  database_id: string
}

export type AppSize = 'big' | 'small'
