import type { FirebaseTimestamp } from '../../../types/firebase'
import type { App } from './app.model.ts'

export type AppSocialLinks = App['social_links']

export type AppDetail = {
  id: string
  project_id: string
  ecosystem_id: string
  slug: string
  status: App['status'] | ''
  name: string
  short_name: string
  role: App['role'] | ''
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: AppSocialLinks
  media: App['media']
  created?: { at: FirebaseTimestamp }
}
