import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { fireuxProjectTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireProjectOperator } from '../core/authority'

export async function removeProjectTeamMember(
  event: H3Event,
  projectIdInput: unknown,
  memberIdInput: unknown
) {
  const memberId = requireFirestoreDocumentId(memberIdInput, 'Team member id')
  const { projectId } = await requireProjectOperator(event, projectIdInput)
  const team = fireuxProjectTeamMembersTarget(projectId)
  let name = 'Team member'
  await runGuardedServerTransaction(team.database, async (transaction) => {
    const current = await transaction.read<Record<string, unknown>>(
      team,
      memberId
    )
    if (!current.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team member was not found.',
      })
    }
    name = String(current.data?.name || '').trim() || name
    transaction.delete(team, memberId)
  })
  return {
    ok: true as const,
    project_id: projectId,
    member_id: memberId,
    name,
  }
}
