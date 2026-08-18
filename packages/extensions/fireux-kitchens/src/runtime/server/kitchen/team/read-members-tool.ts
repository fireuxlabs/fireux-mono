import type { H3Event } from 'h3'
import { readKitchenTeamMembers } from './read.ts'

export const readKitchenTeamMembersTool = {
  id: 'kitchen.team.read-members',
  mode: 'read',
  confirmation: 'none',
  description: 'Read the current bounded Kitchen Team member list.',
} as const

export const executeReadKitchenTeamMembersTool = (
  event: H3Event,
  input: { kitchenId: string }
) => readKitchenTeamMembers(event, input)
