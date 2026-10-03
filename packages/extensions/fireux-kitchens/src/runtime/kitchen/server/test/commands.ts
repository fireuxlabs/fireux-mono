import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  serverAuditStamp,
  serverTimestamp,
} from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenTestsTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

const testValue = (input: unknown) => {
  const value = String(input ?? '')
    .trim()
    .replace(/\s+/g, ' ')
  if (!value || value.length > 120)
    throw createError({
      statusCode: 400,
      statusMessage:
        'Test value is required and must be 120 characters or fewer.',
    })
  return value
}

async function authority(event: H3Event, kitchenIdInput: unknown) {
  const kitchenId = requireFirestoreDocumentId(kitchenIdInput, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  return { kitchenId, actor }
}

export async function createKitchenTest(
  event: H3Event,
  input: { kitchenId?: unknown; value?: unknown }
) {
  const { kitchenId, actor } = await authority(event, input?.kitchenId)
  const value = testValue(input?.value)
  const testId = randomUUID()
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    mutations.create(serverKitchenTestsTarget(kitchenId), testId, {
      value,
      created_at: serverTimestamp(),
      created: serverAuditStamp({ by: actor.uid }),
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, kitchen_id: kitchenId, test: { id: testId, value } }
}

export async function updateKitchenTest(
  event: H3Event,
  input: { kitchenId?: unknown; testId?: unknown; value?: unknown }
) {
  const { kitchenId, actor } = await authority(event, input?.kitchenId)
  const testId = requireFirestoreDocumentId(input?.testId, 'Test id')
  const value = testValue(input?.value)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const tests = serverKitchenTestsTarget(kitchenId)
    if (!(await mutations.read(tests, testId)).exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Test was not found.',
      })
    mutations.update(tests, testId, {
      value,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, kitchen_id: kitchenId, test: { id: testId, value } }
}

export async function deleteKitchenTest(
  event: H3Event,
  input: { kitchenId?: unknown; testId?: unknown }
) {
  const { kitchenId, actor } = await authority(event, input?.kitchenId)
  const testId = requireFirestoreDocumentId(input?.testId, 'Test id')
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const tests = serverKitchenTestsTarget(kitchenId)
    if (!(await mutations.read(tests, testId)).exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Test was not found.',
      })
    mutations.delete(tests, testId)
  })
  return { ok: true as const, kitchen_id: kitchenId, testId }
}
