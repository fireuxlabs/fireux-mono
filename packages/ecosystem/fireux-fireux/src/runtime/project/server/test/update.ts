import { fireuxProjectTestsTarget } from '../targets'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { requireProjectOperator } from '../authority'
import { requireProjectOperatorInTransaction } from '../authority'

export async function updateProjectTest(
  event: H3Event,
  projectIdInput: unknown,
  testIdInput: unknown,
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
  const testId = requireFirestoreDocumentId(testIdInput, 'Test id')
  const actor = await requireProjectOperator(event, projectIdInput)
  const { uid, projectId } = actor
  const tests = fireuxProjectTestsTarget(projectId)
  await runGuardedServerTransaction(tests.database, async (transaction) => {
    await requireProjectOperatorInTransaction(transaction, actor)
    const current = await transaction.read(tests, testId)
    if (!current.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Test was not found.',
      })
    }
    transaction.update(tests, testId, {
      value,
      updated: serverAuditStamp({ by: uid }),
    })
  })
  return {
    ok: true as const,
    project_id: projectId,
    test: { id: testId, value },
  }
}
