import type { H3Event } from 'h3'
import { readKitchenTeamMembers } from '../team/read'
import type { KitchenTeamToolMember } from '../team/tools/index'
import type { KitchenAgentRequest } from './types'

export async function readKitchenTeamToolMembers(
  event: H3Event,
  request: Pick<KitchenAgentRequest, 'appId' | 'kitchenId'>
): Promise<KitchenTeamToolMember[]> {
  const result = await readKitchenTeamMembers(event, {
    kitchenId: request.kitchenId,
  })
  return result.members.map(({ memberId, name, linked }) => ({
    memberId,
    name,
    linked,
  }))
}
