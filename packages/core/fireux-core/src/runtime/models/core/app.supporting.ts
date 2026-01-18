// FILE: packages/core/fireux-core/src/runtime/models/core/app.supporting.ts

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
}

export const createEmptyAppSocialLinks = (): AppSocialLinks => ({
  website: '',
  twitter: '',
  github: '',
  linkedin: '',
  instagram: '',
})
