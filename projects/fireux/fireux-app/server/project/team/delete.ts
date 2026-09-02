import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { fireuxProjectTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireProjectOperator } from '../core/authority'

export async function deactivateProjectTeamMember(
  event: H3Event,
  projectIdInput: unknown,
  memberIdInput: unknown
) {
  const memberId = requireFirestoreDocumentId(memberIdInput, 'Team member id')
  const { uid, projectId } = await requireProjectOperator(event, projectIdInput)
  const team = fireuxProjectTeamMembersTarget(projectId)
  let name = 'Team member'
  await runGuardedServerTransaction(team.database, async (transaction) => {
    const current = await transaction.read<Record<string, unknown>>(team, memberId)
    if (!current.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Team member was not found.' })
    }
    if (String(current.data?.role || '').trim() === 'owner') {
      throw createError({ statusCode: 409, statusMessage: 'The Project owner cannot be deactivated.' })
    }
    name = String(current.data?.name || '').trim() || name
    transaction.update(team, memberId, {
      status: 'inactive',
      updated: serverAuditStamp({ by: uid }),
    })
  })
  return { ok: true as const, project_id: projectId, member_id: memberId, name, status: 'inactive' as const }
}
