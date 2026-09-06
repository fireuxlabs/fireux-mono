import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
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
  if (
    Object.keys(source).some(
      (key) => key !== 'jobTitle' && key !== 'name' && key !== 'role'
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  }
  const name = text(source.name)
  const role = text(source.role)
  if (!name || name.length > 120) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Team member name is required and must be 120 characters or fewer.',
    })
  }
  if (role && role !== 'operator' && role !== 'member') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team member role is invalid.',
    })
  }
  if (
    source.jobTitle !== undefined &&
    (typeof source.jobTitle !== 'string' || source.jobTitle.length > 120)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job title must be 120 characters or fewer.',
    })
  }
  const jobTitle =
    source.jobTitle === undefined ? undefined : text(source.jobTitle)
  const memberId = requireFirestoreDocumentId(memberIdInput, 'Team member id')
  const { uid, projectId } = await requireProjectOperator(event, projectIdInput)
  const team = fireuxProjectTeamMembersTarget(projectId)
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
    const currentRole = text(current.data?.role)
    transaction.update(team, memberId, {
      name,
      ...(jobTitle !== undefined ? { job_title: jobTitle } : {}),
      ...(currentRole === 'owner' || !role ? {} : { role }),
      updated: serverAuditStamp({ by: uid }),
    })
  })
  return { ok: true as const, project_id: projectId, member_id: memberId, name }
}
