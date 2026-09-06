import { kitchenTeamMembersReadTool as definition } from '../../../tools/team'
import { readKitchenTeamMembers } from '../read'
import type { KitchenTeamServerTool } from './types'

const joinNames = (names: string[]) => {
  if (names.length < 2) return names[0] || ''
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

const presentMembers = (
  members: Awaited<ReturnType<typeof readKitchenTeamMembers>>['members']
) => {
  if (!members.length) return 'This Kitchen Team has no members.'

  const linkedCount = members.filter((member) => member.linked).length
  const accountSummary =
    linkedCount === members.length
      ? 'Every member has a linked account.'
      : linkedCount === 0
        ? 'No members have linked accounts yet.'
        : `${linkedCount} ${linkedCount === 1 ? 'member has' : 'members have'} a linked account; ${members.length - linkedCount} ${members.length - linkedCount === 1 ? 'is' : 'are'} not linked yet.`

  return `This Kitchen Team has ${members.length} ${members.length === 1 ? 'member' : 'members'}. ${joinNames(members.map((member) => member.name))}. ${accountSummary}`
}

export const kitchenTeamMembersReadExecutor = {
  definition,
  prepare() {
    return {
      id: definition.id,
      input: {},
      name: 'Kitchen Team',
      confirmation: '',
    }
  },
  async execute(event, kitchenId) {
    const result = await readKitchenTeamMembers(event, { kitchenId })
    return {
      answer: presentMembers(result.members),
      result,
    }
  },
} satisfies KitchenTeamServerTool
