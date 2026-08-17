import type { H3Event } from 'h3'
import {
  createKitchenTeamMember,
  type CreateKitchenTeamMemberResult,
} from './create.ts'

export const addKitchenTeamMemberTool = {
  id: 'kitchen.team.add-member',
  mode: 'write',
  confirmation: 'required',
  description: 'Add an operational member to the selected Kitchen team.',
} as const

export function executeAddKitchenTeamMemberTool(
  event: H3Event,
  input: { kitchenId: string; name: string }
): Promise<CreateKitchenTeamMemberResult> {
  return createKitchenTeamMember(event, input)
}
