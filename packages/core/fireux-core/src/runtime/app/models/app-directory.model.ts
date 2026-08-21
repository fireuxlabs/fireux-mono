import type { FirebaseTimestamp } from '../../../types/firebase'
import type {
  AppDerived,
  AppMedia,
  AppRole,
  AppSocialLinks,
  AppStatus,
} from './app.model.ts'

export type AppDetail = {
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
