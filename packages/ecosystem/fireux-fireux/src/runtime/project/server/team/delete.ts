import { fireuxProjectTeamMembersTarget } from '../targets'
import type { H3Event } from 'h3'
import { deleteTeamMember } from 'fireux-core/runtime/server/utils/workspace-team/members'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  requireProjectOperator,
  requireProjectOperatorInTransaction,
} from '../authority'

export async function removeProjectTeamMember(
  event: H3Event,
  projectIdInput: unknown,
  memberIdInput: unknown
) {
  const memberId = requireFirestoreDocumentId(memberIdInput, 'Team member id')
  const actor = await requireProjectOperator(event, projectIdInput)
  const { projectId } = actor
  const team = fireuxProjectTeamMembersTarget(projectId)
  const { name } = await runGuardedServerTransaction(
    team.database,
    async (tx) => {
      await requireProjectOperatorInTransaction(tx, actor)
      return deleteTeamMember(tx, team, memberId)
    }
  )
  return {
    ok: true as const,
    project_id: projectId,
    member_id: memberId,
    name,
  }
}
