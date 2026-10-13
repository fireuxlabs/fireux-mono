import { createError, type H3Event } from 'h3'
import { isDeepStrictEqual } from 'node:util'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import {
  readKitchenOrderIntake,
  kitchenOrderIntakeFromRoot,
} from '../../utils/order-intake'

export async function updateKitchenOrderIntake(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Order intake settings are required.',
    })
  const body = input as Record<string, unknown>
  if (
    Object.keys(body).some(
      (key) => !['kitchenId', 'intake', 'expected'].includes(key)
    ) ||
    !Object.hasOwn(body, 'intake') ||
    !Object.hasOwn(body, 'expected')
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Order intake settings are required.',
    })
  const kitchenId = requireFirestoreDocumentId(body.kitchenId, 'Kitchen id')
  let intake
  let expected
  try {
    intake = readKitchenOrderIntake(body.intake)
    expected = readKitchenOrderIntake(body.expected)
  } catch (cause) {
    throw createError({
      statusCode: 400,
      statusMessage: (cause as Error).message,
    })
  }
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenRecordMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    if (
      !isDeepStrictEqual(
        kitchenOrderIntakeFromRoot(authority.rootData),
        expected
      )
    )
      throw createError({
        statusCode: 409,
        statusMessage:
          'Service settings changed. Review the current settings and try again.',
      })
    tx.update(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      'orders.intake': intake,
      updated: serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }),
    })
  })
  return { ok: true as const, kitchenId, intake }
}
