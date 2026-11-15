import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { kitchenGuidance, resolveKitchenGuidance } from '../../content/guidance'
import { KITCHEN_MUTATION_TARGETS } from '../mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'

function validIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= kitchenGuidance.length &&
    new Set(value).size === value.length &&
    value.every((id) => kitchenGuidance.some((guide) => guide.id === id))
  )
}

/** Save references only; common guidance stays source-owned and context stays local. */
export async function updateKitchenGuidance(event: H3Event, input: unknown) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) => !['kitchenId', 'guidanceIds', 'previous'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid guidance request.',
    })
  const value = input as Record<string, unknown>
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  if (!validIds(value.guidanceIds) || !validIds(value.previous))
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose known guidance once each.',
    })
  const guidanceIds = resolveKitchenGuidance(value.guidanceIds).map(
    (guide) => guide.id
  )
  const previous = resolveKitchenGuidance(value.previous).map(
    (guide) => guide.id
  )
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenRecordMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const stored = access.rootData.guidance_ids ?? []
    const current = resolveKitchenGuidance(stored).map((guide) => guide.id)
    if (
      !validIds(stored) ||
      JSON.stringify(current) !== JSON.stringify(previous)
    )
      throw createError({
        statusCode: 409,
        statusMessage:
          'Shared guidance changed elsewhere. Reload before saving again.',
      })
    tx.update(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId, {
      guidance_ids: guidanceIds,
      updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
    })
    return { kitchenId, guidanceIds }
  })
}
