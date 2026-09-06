import type { KitchenTeamMember } from '../../models/team.model'

export function buildKitchenTeamMemberRecord(input: {
  name: string
  userId?: string
  roleIds?: string[]
}): KitchenTeamMember {
  return {
    name: input.name,
    user_id: input.userId || '',
    role_ids: input.roleIds || [],
  }
}
