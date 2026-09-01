import { kitchenTeamMemberDeleteTool as definition } from '../../../tools/team'
import { deleteKitchenTeamMember } from '../delete'
import type { KitchenTeamServerTool } from './types'

const memberId = (input: unknown) => {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  return String(source.memberId ?? '').trim()
}

export const kitchenTeamMemberDeleteExecutor = {
  definition,
  prepare(input, members) {
    const member = members.find(
      (candidate) => candidate.memberId === memberId(input)
    )
    return member && member.role !== 'owner'
      ? {
          id: definition.id,
          input: { memberId: member.memberId },
          name: member.name,
          confirmation: `Deactivate ${member.name} and revoke their Kitchen access?`,
        }
      : null
  },
  async execute(event, kitchenId, prepared) {
    const result = await deleteKitchenTeamMember(event, {
      kitchenId,
      memberId: memberId(prepared.input),
    })
    return {
      answer: `${result.name} has been deactivated and their Kitchen access has been revoked.`,
      result,
    }
  },
} satisfies KitchenTeamServerTool
