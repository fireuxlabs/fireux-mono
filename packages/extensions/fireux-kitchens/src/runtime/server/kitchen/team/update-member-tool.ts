import type { H3Event } from 'h3'
import {
  updateKitchenMemberNames,
  type KitchenMemberNameChange,
} from './update.ts'

export const updateKitchenMemberTool = {
  id: 'kitchen.team.update-member',
  mode: 'write',
  confirmation: 'required',
  description:
    'Update an allowed field on an existing member of the selected Kitchen team.',
  fields: ['name'],
} as const

export function executeUpdateKitchenMemberPlan(
  event: H3Event,
  input: { kitchenId: string; changes: KitchenMemberNameChange[] }
) {
  return updateKitchenMemberNames(event, input)
}
