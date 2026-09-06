import { kitchenTeamMemberCreateTool as definition } from '../../../tools/team'
import { createKitchenTeamMember } from '../create'
import type { KitchenTeamServerTool } from './types'
const text = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
export const kitchenTeamMemberCreateExecutor = {
  definition,
  prepare(input) {
    const name = text((input as { name?: unknown })?.name)
    return name && name.length <= 120
      ? {
          id: definition.id,
          input: { name },
          name,
          confirmation: `Add ${name} to this Kitchen Team?`,
        }
      : null
  },
  async execute(event, kitchenId, prepared) {
    const created = await createKitchenTeamMember(event, {
      kitchenId,
      name: text(prepared.input.name),
    })
    return {
      answer: `${created.name} has been added.`,
      result: created,
      createdObject: {
        name: created.name,
        kind: 'Team member',
        to: `/workspace/kitchen/team/${created.memberId}`,
      },
    }
  },
} satisfies KitchenTeamServerTool
