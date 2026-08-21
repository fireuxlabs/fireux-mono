export type ProjectTeamMember = {
  id: string
  user_id: string
  role: 'owner' | 'operator' | 'member'
  permissions: string[]
  status: 'active' | 'inactive'
}
