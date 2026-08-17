import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { KitchenTeamMemberDefaults } from '../../../models/kitchen/team.model.ts'

export function buildKitchenTeamMemberRecord(input: {
  appId: string
  createdBy: string
  kitchenId: string
  memberId: string
  name: string
  slug: string
  userId?: string
}) {
  return {
    ...KitchenTeamMemberDefaults,
    id: input.memberId,
    kitchen_id: input.kitchenId,
    user_id: input.userId || '',
    name: input.name,
    slug: input.slug,
    display_name: input.name,
    created: serverAuditStamp({ by: input.createdBy, appId: input.appId }),
    updated: serverAuditStamp({ by: input.createdBy }),
  }
}
