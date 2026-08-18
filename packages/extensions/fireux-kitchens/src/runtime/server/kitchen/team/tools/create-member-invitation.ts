import { kitchenTeamMemberInvitationCreateTool as definition } from '../../../../tools/kitchen/team'
import { createKitchenMemberInvitation } from '../member-invitation'
import type { KitchenTeamServerTool } from './types'

const memberId = (input: unknown) => {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  return String(source.memberId ?? '').trim()
}

export const kitchenTeamMemberInvitationCreateExecutor = {
  definition,
  prepare(input, members) {
    const member = members.find(
      (candidate) => candidate.memberId === memberId(input)
    )
    return member && !member.linked
      ? {
          id: definition.id,
          input: { memberId: member.memberId },
          name: member.name,
          confirmation: `Create a one-use invitation link for ${member.name}?`,
        }
      : null
  },
  async execute(event, kitchenId, prepared) {
    const result = await createKitchenMemberInvitation(event, {
      kitchenId,
      memberId: memberId(prepared.input),
    })
    return {
      answer: `A one-use invitation for ${result.memberName} is ready and expires in seven days.`,
      result,
      resultAction: {
        kind: definition.result.primaryAction,
        label: definition.result.label,
        value: `/kitchen/member-invitation/${encodeURIComponent(result.token)}`,
      },
    }
  },
} satisfies KitchenTeamServerTool
