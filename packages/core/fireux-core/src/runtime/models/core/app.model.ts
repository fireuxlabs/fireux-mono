export interface App {
  id: string
  app_name: string
  admin_ids: string[]
  is_tenant?: boolean // Flag to identify if this is a tenant app (vs platform app) - defaults to true since most apps will be tenants
  created_at?: string
  creator_id?: string // Changed from created_by to match other objects
}
