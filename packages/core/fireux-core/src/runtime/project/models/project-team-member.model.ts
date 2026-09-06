export type ProjectTeamMember = {
  id: string
  job_title?: string
  user_id: string
  role: 'owner' | 'operator' | 'member'
  permissions: string[]
  status: 'active' | 'inactive'
}
