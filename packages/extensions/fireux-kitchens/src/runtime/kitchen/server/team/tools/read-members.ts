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
  if (!members.length) return 'This Kitchen Team has no active members.'

  const roleSummary = (
    [
      ['owner', 'Owner'],
      ['operator', 'Operator'],
      ['member', 'Members'],
    ] as const
  )
    .map(([role, label]) => {
      const names = members
        .filter((member) => member.role === role)
        .map((member) => member.name)
      if (!names.length) return ''
      return `${names.length === 1 && role === 'member' ? 'Member' : label}: ${joinNames(names)}.`
    })
    .filter(Boolean)
    .join(' ')

  const linkedCount = members.filter((member) => member.linked).length
  const accountSummary =
    linkedCount === members.length
      ? 'Every member has a linked account.'
      : linkedCount === 0
        ? 'No members have linked accounts yet.'
        : `${linkedCount} ${linkedCount === 1 ? 'member has' : 'members have'} a linked account; ${members.length - linkedCount} ${members.length - linkedCount === 1 ? 'is' : 'are'} not linked yet.`

  return `This Kitchen Team has ${members.length} active ${members.length === 1 ? 'member' : 'members'}. ${roleSummary} ${accountSummary}`
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
