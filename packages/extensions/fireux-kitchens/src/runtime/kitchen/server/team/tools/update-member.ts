import { kitchenTeamMemberUpdateTool as definition } from '../../../tools/team'
import { updateKitchenTeamMembers } from '../update'
import type { KitchenTeamServerTool } from './types'
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export const kitchenTeamMemberUpdateExecutor = {
  definition,
  prepare(input, members) {
    const source = record(input).updates
    if (!Array.isArray(source)) return null
    const updates = source.map(record).flatMap((update) => {
      const member = members.find(
        (member) => member.memberId === update.memberId
      )
      const changes = record(update.changes)
      const name = String(changes.name || member?.name || '').trim()
      if (
        !member ||
        !name ||
        name.length > 120 || Object.keys(changes).some(key => key !== 'name')
      )
        return []
      return [
        {
          memberId: member.memberId,
          changes: { name },
        },
      ]
    })
    return updates.length
      ? {
          id: definition.id,
          name: 'Team members',
          input: { updates },
          confirmation: `Update ${updates.length} Team members?`,
        }
      : null
  },
  async execute(event, kitchenId, prepared) {
    const result = await updateKitchenTeamMembers(event, {
      kitchenId,
      updates: prepared.input.updates as Parameters<
        typeof updateKitchenTeamMembers
      >[1]['updates'],
    })
    return { answer: `${result.updates.length} Team members updated.`, result }
  },
} satisfies KitchenTeamServerTool
