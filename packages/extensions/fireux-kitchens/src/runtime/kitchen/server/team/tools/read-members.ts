import { kitchenTeamMembersReadTool as definition } from '../../../tools/team'
import { readKitchenTeamMembers } from '../read'
import type { KitchenTeamServerTool } from './types'

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
      answer: result.members.length
        ? `This Kitchen Team has ${result.members.length} ${result.members.length === 1 ? 'member' : 'members'}: ${result.members.map((member) => member.name).join(', ')}.`
        : 'This Kitchen Team has no members.',
      result,
    }
  },
} satisfies KitchenTeamServerTool
