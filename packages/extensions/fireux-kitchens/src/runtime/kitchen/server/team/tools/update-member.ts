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
const memberRole = (value: unknown) => {
  const role = String(value ?? '').trim()
  return role === 'operator' || role === 'member' ? role : ''
}

function selectedChanges(
  input: unknown,
  members: readonly KitchenTeamToolMember[]
) {
  const updates = record(input).updates
  const requested = new Map(
    (Array.isArray(updates) ? updates : []).map(record).map((update) => {
      const changes = record(update.changes)
      return [
        String(update.memberId ?? '').trim(),
        {
          name: memberName(changes.name),
          role: memberRole(changes.role),
        },
      ] as const
    })
  )
  return members.flatMap((member) => {
    const changes = requested.get(member.memberId)
    const name = changes?.name || member.name
    const role = changes?.role || member.role
    return changes &&
      name.length <= 120 &&
      (name !== member.name || role !== member.role) &&
      member.role !== 'owner'
      ? [{ memberId: member.memberId, previousName: member.name, name, role }]
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
        updates: changes.map(({ memberId, name, role }) => ({
          memberId,
          changes: { name, role },
        })),
      },
      confirmation: `Update ${changes
        .map(
          (change) => `${change.previousName} → ${change.name} (${change.role})`
        )
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
          changes: (() => {
            const changes = record(update.changes)
            const role = memberRole(changes.role)
            return {
              name: memberName(changes.name),
              ...(role ? { role } : {}),
            }
          })(),
        })),
    })
    return {
      answer: `${result.updates.length} Team ${result.updates.length === 1 ? 'name has' : 'names have'} been updated.`,
      result,
    }
  },
} satisfies KitchenTeamServerTool
