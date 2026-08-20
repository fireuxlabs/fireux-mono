import { kitchenTeamMemberCreateTool as definition } from '../../../tools/team'
import { createKitchenTeamMember } from '../create'
import type { KitchenTeamServerTool } from './types'

const memberName = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

const optionalText = (value: unknown, maxLength: number) =>
  memberName(value).slice(0, maxLength)

const certifications = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((item) => optionalText(item, 120))
    .filter(Boolean)
    .slice(0, 20)

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
          input: {
            name,
            role: optionalText(source.role, 120),
            station: optionalText(source.station, 120),
            certifications: certifications(source.certifications),
            notes: optionalText(source.notes, 1_000),
          },
          name,
          confirmation: `Add ${name} to this Kitchen team?`,
        }
      : null
  },
  async execute(event, kitchenId, prepared) {
    const name = memberName(prepared.input.name)
    const created = await createKitchenTeamMember(event, {
      kitchenId,
      name,
      role: optionalText(prepared.input.role, 120),
      station: optionalText(prepared.input.station, 120),
      certifications: certifications(prepared.input.certifications),
      notes: optionalText(prepared.input.notes, 1_000),
    })
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
