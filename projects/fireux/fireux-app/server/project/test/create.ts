import { fireuxProjectTestsTarget } from 'fireux-fireux/runtime/project/server/targets'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverAuditStamp,
  serverTimestamp,
} from 'fireux-core/runtime/server/utils/records/stamps'
import { requireProjectTestAuthority } from './authority'
import { requireProjectOperatorInTransaction } from '../core/authority'

export async function createProjectTest(
  event: H3Event,
  projectIdInput: unknown,
  input: unknown
) {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  if (Object.keys(source).some((key) => key !== 'value')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Test field.',
    })
  }
  const value = String(source.value ?? '').trim()
  if (!value || value.length > 120) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Test value is required and must be 120 characters or fewer.',
    })
  }

  const actor = await requireProjectTestAuthority(
    event,
    projectIdInput
  )
  const { uid, projectId, db } = actor
  const tests = fireuxProjectTestsTarget(projectId)
  const testId = db
    .collection('projects')
    .doc(projectId)
    .collection('tests')
    .doc().id
  await runGuardedServerTransaction(tests.database, async (transaction) => {
    await requireProjectOperatorInTransaction(transaction, actor)
    transaction.create(tests, testId, {
      value,
      created_at: serverTimestamp(),
      created: serverAuditStamp({ by: uid }),
      updated: serverAuditStamp({ by: uid }),
    })
  })
  return {
    ok: true as const,
    project_id: projectId,
    test: { id: testId, value },
  }
}
