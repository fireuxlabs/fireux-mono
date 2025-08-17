export interface App {
  id: string
  app_name: string
  admin_ids: string[]
  created_at?: string
  creator_id?: string // Changed from created_by to match other objects
}
