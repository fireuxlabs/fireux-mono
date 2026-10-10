import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { readKitchenSellable, readSellableTerms } from '../../utils/sellable'
import { serverKitchenSellablesTarget } from './target'

/** The only commercial writer for an adopted placement. Variant identity remains immutable. */
export async function updateKitchenSellableTerms(
  event: H3Event,
  input: unknown
) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) =>
        !['kitchenId', 'sellableId', 'expectedRevision', 'terms'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sellable terms input.',
    })
  const value = input as Record<string, unknown>
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const sellableId = requireFirestoreDocumentId(value.sellableId, 'Sellable id')
  const expectedRevision = value.expectedRevision
  if (
    typeof expectedRevision !== 'number' ||
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 1
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide the reviewed sellable revision.',
    })
  let terms
  try {
    terms = readSellableTerms(value.terms)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sellable commercial terms.',
    })
  }
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenSellablesTarget(kitchenId)
    const record = await tx.read(target, sellableId)
    if (!record.exists)
      throw createError({
        statusCode: 409,
        statusMessage: 'Sellable is missing.',
      })
    const current = readKitchenSellable(record.data)
    if (expectedRevision !== current.revision)
      throw createError({
        statusCode: 409,
        statusMessage: 'Commercial terms changed. Reload before saving.',
      })
    if (current.revision === Number.MAX_SAFE_INTEGER)
      throw createError({
        statusCode: 409,
        statusMessage: 'The stored sellable revision cannot be advanced.',
      })
    let next
    try {
      next = readKitchenSellable({
        ...current,
        terms,
        revision: current.revision + 1,
      })
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid sellable commercial terms.',
      })
    }
    if (next.terms.currency !== readPlaceCurrencyCode(access.placeData))
      throw createError({
        statusCode: 409,
        statusMessage: 'Currency must match the Kitchen.',
      })
    tx.update(target, sellableId, {
      terms: next.terms,
      revision: next.revision,
      updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
    })
    return { ok: true as const, kitchenId, sellableId, revision: next.revision }
  })
}
