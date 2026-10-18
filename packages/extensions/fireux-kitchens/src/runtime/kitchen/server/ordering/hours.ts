import { createError, type H3Event } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { hoursWithinParent } from '../../utils/service-hours'
import { resolveKitchenOperationHours } from '../../utils/kitchen-readers'
import { requireOperatingHours } from '../../utils/operating-hours'

function request(input: unknown) {
  const fail = (): never => {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose venue hours or provide valid Kitchen hours.',
    })
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail()
  const body = input as Record<string, unknown>
  if (
    Object.keys(body).some((key) => !['kitchenId', 'hours'].includes(key)) ||
    !Object.hasOwn(body, 'hours')
  )
    fail()
  const kitchenId = requireFirestoreDocumentId(body.kitchenId, 'Kitchen id')
  if (body.hours === null) return { kitchenId, hours: null }
  if (
    !body.hours ||
    typeof body.hours !== 'object' ||
    Array.isArray(body.hours)
  )
    fail()
  const hours = body.hours as Record<string, unknown>
  if (
    Object.keys(hours).some(
      (key) => !['source', 'timezone', 'windows'].includes(key)
    ) ||
    hours.source !== 'custom' ||
    !Array.isArray(hours.windows) ||
    hours.windows.length > 100
  )
    fail()
  try {
    return { kitchenId, hours: requireOperatingHours(hours) }
  } catch {
    return fail()
  }
}

/** Updates the existing Kitchen operating schedule, without touching venue or service policy. */
export async function updateKitchenOperationHours(
  event: H3Event,
  input: unknown
) {
  const requested = request(input)
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      requested.kitchenId
    )
    if (
      requested.hours &&
      !hoursWithinParent(
        requested.hours,
        resolveKitchenOperationHours({}, authority.placeData)
      )
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'Kitchen hours must fit within venue opening hours.',
      })
    tx.update(FIRESTORE_MUTATION_TARGETS.kitchens, requested.kitchenId, {
      'orders.operation_hours': requested.hours ?? FieldValue.delete(),
      updated: serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }),
    })
  })
  return { ok: true as const, kitchenId: requested.kitchenId }
}
