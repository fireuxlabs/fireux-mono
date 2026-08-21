import type { FirebaseTimestamp } from '../../../types/firebase'
import type { App } from './app.model.ts'

export type AppSocialLinks = App['social_links']

export type AppDetail = {
  id: string
  ecosystem_id: string
  slug: string
  status: App['status'] | ''
  app_name: string
  app_short_name: string
  role: App['role'] | ''
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: AppSocialLinks
  derived: {
    user_count: number
  }
  media: App['media']
  created?: { at: FirebaseTimestamp }
}
