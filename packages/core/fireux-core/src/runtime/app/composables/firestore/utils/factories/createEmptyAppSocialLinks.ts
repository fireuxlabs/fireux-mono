import type { App } from '../../../../models/app.model.ts'

export const createEmptyAppSocialLinks = (): NonNullable<App['social_links']> => ({
  website: '',
  twitter: '',
  github: '',
  linkedin: '',
  instagram: '',
  facebook: '',
  youtube: '',
  email: '',
})
