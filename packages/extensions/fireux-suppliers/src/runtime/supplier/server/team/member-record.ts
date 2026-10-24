import type { WorkspaceTeamMemberRecord } from 'fireux-core/runtime/workspace/models/team-member.model'

export function buildSupplierTeamMemberRecord(input: {
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
