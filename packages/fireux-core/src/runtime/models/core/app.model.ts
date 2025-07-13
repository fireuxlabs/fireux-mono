export interface App {
  id: string
  app_name: string
  admin_ids: string[]
  created_at?: string
  project?: string
  description?: string
  social_links?: {
    twitter?: string
    facebook?: string
    linkedin?: string
    instagram?: string
    youtube?: string
    website?: string
  }
}
