/** A person in this Kitchen. Record identity and access authority belong to storage. */
export type KitchenTeamMember = {
  name: string
  user_id: string
  role_ids: string[]
  status: 'active' | 'inactive'
}
