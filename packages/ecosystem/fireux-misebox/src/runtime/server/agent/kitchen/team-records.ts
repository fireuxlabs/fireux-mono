import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { KitchenTeamToolMember } from 'fireux-kitchens/runtime/kitchen/server/team/tools/index'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'

export async function readKitchenTeamToolMembers(
  access: KitchenAgentAccess,
  request: Pick<KitchenAgentRequest, 'appId' | 'kitchenId'>
): Promise<KitchenTeamToolMember[]> {
  const snapshot = await access.db
    .collection(`kitchens/${request.kitchenId}/team`)
    .limit(200)
    .get()
  return snapshot.docs.map((document) => ({
    memberId: document.id,
    name: readRecordString(document.data(), 'name'),
    linked: Boolean(readRecordString(document.data(), 'user_id')),
  }))
}
