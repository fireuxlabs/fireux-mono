import { kitchenTeamMemberUpdateTool as definition } from '../../../tools/team'
import { updateKitchenTeamMembers } from '../update'
import type { KitchenTeamServerTool, KitchenTeamToolMember } from './types'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const memberName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

function selectedChanges(
  input: unknown,
  members: readonly KitchenTeamToolMember[]
) {
  const updates = record(input).updates
  const requested = new Map(
    (Array.isArray(updates) ? updates : [])
      .map(record)
      .map((update) => [
        String(update.memberId ?? '').trim(),
        memberName(record(update.changes).name),
      ])
  )
  return members.flatMap((member) => {
    const name = requested.get(member.memberId)
    return name && name.length <= 120 && name !== member.name
      ? [{ memberId: member.memberId, previousName: member.name, name }]
      : []
  })
}

export const kitchenTeamMemberUpdateExecutor = {
  definition,
  prepare(input, members) {
    const changes = selectedChanges(input, members)
    if (!changes.length || changes.length > 200) return null
    return {
      id: definition.id,
      name: 'Team member names',
      input: {
        updates: changes.map(({ memberId, name }) => ({
          memberId,
          changes: { name },
        })),
      },
      confirmation: `Update ${changes
        .map((change) => `${change.previousName} → ${change.name}`)
        .join(', ')}?`,
    }
  },
  async execute(event, kitchenId, prepared) {
    const updates = record(prepared.input).updates
    const result = await updateKitchenTeamMembers(event, {
      kitchenId,
      updates: (Array.isArray(updates) ? updates : [])
        .map(record)
        .map((update) => ({
          memberId: String(update.memberId ?? '').trim(),
          changes: { name: memberName(record(update.changes).name) },
        })),
    })
    return {
      answer: `${result.updates.length} Team ${result.updates.length === 1 ? 'name has' : 'names have'} been updated.`,
      result,
    }
  },
} satisfies KitchenTeamServerTool
