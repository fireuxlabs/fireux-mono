import { updateTeamMembers } from 'fireux-core/runtime/server/utils/workspace-team/members'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { fireuxProjectTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireProjectOperator } from '../core/authority'
const text = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
export async function updateProjectTeamMember(
  event: H3Event,
  projectIdInput: unknown,
  memberIdInput: unknown,
  input: unknown
) {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  const name = text(source.name)
  if (
    !name ||
    name.length > 120 ||
    Object.keys(source).some((key) => key !== 'name')
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter a valid name.',
    })
  const memberId = requireFirestoreDocumentId(memberIdInput, 'Member id')
  const { projectId } = await requireProjectOperator(event, projectIdInput)
  const team = fireuxProjectTeamMembersTarget(projectId)
  await runGuardedServerTransaction(team.database, (tx) =>
    updateTeamMembers(tx, team, [{ memberId, changes: { name } }])
  )
  return { ok: true as const, project_id: projectId, member_id: memberId, name }
}
