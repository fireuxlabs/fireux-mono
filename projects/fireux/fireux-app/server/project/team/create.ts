import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { fireuxProjectTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { requireProjectOperator } from '../core/authority'
import { useRuntimeConfig } from '#imports'

const text = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

export async function createProjectTeamMember(
  event: H3Event,
  projectIdInput: unknown,
  input: unknown
) {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  if (
    Object.keys(source).some(
      (key) => key !== 'jobTitle' && key !== 'name' && key !== 'userId'
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  }
  let name = text(source.name)
  if (!name || name.length > 120) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Team member name is required and must be 120 characters or fewer.',
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
  const userId = source.userId
    ? requireFirestoreDocumentId(source.userId, 'User id')
    : ''
  const { uid, projectId, db } = await requireProjectOperator(
    event,
    projectIdInput
  )
  if (userId) {
    const appId = requireFirestoreDocumentId(
      useRuntimeConfig().public?.fireux?.id,
      'FireUX App id'
    )
    const [user, appMember] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('apps').doc(appId).collection('users').doc(userId).get(),
    ])
    if (!user.exists || !appMember.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User is not available in this App.',
      })
    }
    name = text(user.data()?.display_name) || text(user.data()?.handle) || name
  }
  const team = fireuxProjectTeamMembersTarget(projectId)
  const memberId = randomUUID()
  await runGuardedServerTransaction(team.database, async (mutations) => {
    if (userId) {
      const linked = await mutations.query(team, {
        field: 'user_id',
        op: '==',
        value: userId,
        limit: 1,
      })
      if (linked.length)
        throw createError({
          statusCode: 409,
          statusMessage: 'This User is already on the Project Team.',
        })
    }
    mutations.create(team, memberId, {
      id: memberId,
      user_id: userId,
      name,
      ...(jobTitle !== undefined ? { job_title: jobTitle } : {}),
      avatar: '',
      role: 'member',
      status: 'active',
      created: serverAuditStamp({ by: uid }),
      updated: serverAuditStamp({ by: uid }),
    })
  })
  return { ok: true as const, memberId, name }
}
