import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { KitchenTeamMemberDefaults } from '../../models/team.model.ts'
import type { FireuxWorkspaceTeamRole } from 'fireux-core/runtime/models/utils/workspace-entity.model'

export function buildKitchenTeamMemberRecord(input: {
  appId: string
  createdBy: string
  kitchenId: string
  memberId: string
  name: string
  slug: string
  userId?: string
  role?: FireuxWorkspaceTeamRole
  jobTitle?: string
  station?: string
  certifications?: string[]
  notes?: string
}) {
  return {
    ...KitchenTeamMemberDefaults,
    id: input.memberId,
    kitchen_id: input.kitchenId,
    user_id: input.userId || '',
    name: input.name,
    slug: input.slug,
    display_name: input.name,
    role: input.role || 'member',
    job_title: input.jobTitle || '',
    station: input.station || '',
    certifications: input.certifications || [],
    notes: input.notes || '',
    created: serverAuditStamp({ by: input.createdBy, appId: input.appId }),
    updated: serverAuditStamp({ by: input.createdBy }),
  }
}
