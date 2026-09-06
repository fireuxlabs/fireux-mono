import { kitchenTeamMembersRemoveTool as definition } from '../../../tools/team'
import { deleteKitchenTeamMember } from '../delete'
import type { KitchenTeamServerTool } from './types'

const memberIds = (input: unknown) => {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  return Array.isArray(source.memberIds)
    ? [
        ...new Set(
          source.memberIds
            .map(String)
            .map((id) => id.trim())
            .filter(Boolean)
        ),
      ]
    : []
}

export const kitchenTeamMembersRemoveExecutor = {
  definition,
  prepare(input, members) {
    const requestedIds = memberIds(input)
    const selected = requestedIds.flatMap((id) => {
      const member = members.find((candidate) => candidate.memberId === id)
      return member ? [member] : []
    })
    if (!requestedIds.length || selected.length !== requestedIds.length)
      return null
    const names = selected.map((member) => member.name)
    return {
      id: definition.id,
      input: { memberIds: selected.map((member) => member.memberId) },
      name: `${selected.length} Team members`,
      confirmation: `Remove ${names.join(', ')}?`,
    }
  },
  async execute(event, kitchenId, prepared) {
    const results = []
    for (const id of memberIds(prepared.input)) {
      results.push(
        await deleteKitchenTeamMember(event, { kitchenId, memberId: id })
      )
    }
    return {
      answer: `${results.map((result) => result.name).join(', ')} ${results.length === 1 ? 'has' : 'have'} been removed.`,
      result: { members: results },
    }
  },
} satisfies KitchenTeamServerTool
