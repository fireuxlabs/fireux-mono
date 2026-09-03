import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { fireuxProjectTestsTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireProjectTestAuthority } from './authority'

export async function deleteProjectTest(
  event: H3Event,
  projectIdInput: unknown,
  testIdInput: unknown
) {
  const testId = requireFirestoreDocumentId(testIdInput, 'Test id')
  const { projectId } = await requireProjectTestAuthority(event, projectIdInput)
  const tests = fireuxProjectTestsTarget(projectId)
  await runGuardedServerTransaction(tests.database, async (transaction) => {
    const current = await transaction.read(tests, testId)
    if (!current.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Test was not found.',
      })
    }
    transaction.delete(tests, testId)
  })
  return { ok: true as const, project_id: projectId, test_id: testId }
}
