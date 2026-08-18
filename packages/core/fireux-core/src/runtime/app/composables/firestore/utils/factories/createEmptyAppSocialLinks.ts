import type { AppSocialLinks } from '../../../../models/app.model.ts'

export const createEmptyAppSocialLinks = (): AppSocialLinks => ({
  website: '',
  twitter: '',
  github: '',
  linkedin: '',
  instagram: '',
  facebook: '',
  youtube: '',
  email: '',
})
