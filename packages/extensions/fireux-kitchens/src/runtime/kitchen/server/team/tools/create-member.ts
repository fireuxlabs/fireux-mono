import { kitchenTeamMemberCreateTool as definition } from '../../../tools/team'
import { createKitchenTeamMember } from '../create'
import type { KitchenTeamServerTool } from './types'

const memberName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

export const kitchenTeamMemberCreateExecutor = {
  definition,
  prepare(input) {
    const source =
      input && typeof input === 'object' && !Array.isArray(input)
        ? (input as Record<string, unknown>)
        : {}
    const name = memberName(source.name)
    return name && name.length <= 120
      ? {
          id: definition.id,
          input: { name },
          name,
          confirmation: `Add ${name} to this Kitchen team?`,
        }
      : null
  },
  async execute(event, kitchenId, prepared) {
    const name = memberName(prepared.input.name)
    const created = await createKitchenTeamMember(event, { kitchenId, name })
    return {
      answer: `${created.name} has been added to this Kitchen team.`,
      result: created,
      createdObject: {
        name: created.name,
        kind: 'Team member',
        to: `/console/kitchen/team#${created.slug}`,
      },
    }
  },
} satisfies KitchenTeamServerTool
