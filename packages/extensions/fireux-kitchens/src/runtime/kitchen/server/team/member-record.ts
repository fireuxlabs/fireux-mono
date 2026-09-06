import type { WorkspaceTeamMemberRecord } from 'fireux-core/runtime/models/workspace-team-member.model'

export function buildKitchenTeamMemberRecord(input: {
  name: string
  userId?: string
  roleIds?: string[]
}): WorkspaceTeamMemberRecord {
  return {
    name: input.name,
    user_id: input.userId || '',
    role_ids: input.roleIds || [],
  }
}
