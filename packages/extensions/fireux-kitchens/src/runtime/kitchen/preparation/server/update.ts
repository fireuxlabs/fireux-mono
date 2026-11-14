import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../../server/core/mutation-authority'
import { readPreparationChanges, type PreparationChanges } from '../changes'
export async function updatePreparation(event: H3Event, input: unknown) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) => !['kitchenId', 'preparationId', 'changes'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Preparation input.',
    })
  const value = input as Record<string, unknown>
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const preparationId = requireFirestoreDocumentId(
    value.preparationId,
    'Preparation id'
  )
  let changes: PreparationChanges
  try {
    changes = readPreparationChanges(value.changes)
  } catch (cause) {
    throw createError({
      statusCode: 400,
      statusMessage:
        cause instanceof Error ? cause.message : 'Invalid Preparation changes.',
    })
  }
  const actor = await readKitchenMutationActor(event)
  const target = defineFirestoreMutationTarget({
    key: 'kitchens.prep-items',
    lane: 'server',
    verbs: ['update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/prep-items`,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenRecordMutationAuthority(tx, actor, kitchenId)
    const current = await tx.read(target, preparationId)
    if (!current.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Preparation not found.',
      })
    if (
      current.data?.kitchen_id != null &&
      current.data.kitchen_id !== kitchenId
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'The stored Preparation belongs to another Kitchen.',
      })
    tx.update(target, preparationId, {
      ...changes,
      updated: serverAuditStamp({ by: actor.uid }),
    })
    return { id: preparationId }
  })
}
