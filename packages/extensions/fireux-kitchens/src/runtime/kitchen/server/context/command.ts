import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverKitchenMenusTarget,
  serverKitchenDishesTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { recipeTarget } from '../recipes/record-input'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'

/** One text field on the selected Kitchen, linked Place or authored business document. */
export async function kitchenRecordContext(
  event: H3Event,
  input: unknown,
  write = false
) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid context request.',
    })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) =>
        ![
          'kitchenId',
          'subject',
          'menuId',
          'recordId',
          ...(write ? ['context', 'previous'] : []),
        ].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported context field.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const subject = String(value.subject)
  if (
    !['kitchen', 'venue', 'menu', 'recipe', 'dish'].includes(subject) ||
    (subject !== 'menu' && value.menuId) ||
    (!['recipe', 'dish'].includes(subject) && value.recordId)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a Kitchen, venue, Menu, Recipe or Dish.',
    })
  const menuId =
    subject === 'menu'
      ? requireFirestoreDocumentId(value.menuId, 'Menu id')
      : ''
  const recordId = ['recipe', 'dish'].includes(subject)
    ? requireFirestoreDocumentId(value.recordId, 'Record id')
    : ''
  if (
    write &&
    (typeof value.context !== 'string' ||
      value.context.length > 32000 ||
      typeof value.previous !== 'string')
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Context must be text up to 32,000 characters.',
    })
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenRecordMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const target =
      subject === 'venue'
        ? FIRESTORE_MUTATION_TARGETS.places
        : subject === 'menu'
          ? serverKitchenMenusTarget(kitchenId)
          : subject === 'recipe'
            ? recipeTarget(kitchenId)
            : subject === 'dish'
              ? serverKitchenDishesTarget(kitchenId)
              : FIRESTORE_MUTATION_TARGETS.kitchens
    const id = recordId || menuId || kitchenId
    const owner =
      subject === 'kitchen'
        ? { exists: true, data: access.rootData }
        : await tx.read(target, id)
    if (!owner.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Context owner was not found.',
      })
    const context = readRecordString(owner.data || {}, 'context')
    if (!write) return { context }
    if (value.previous !== context)
      throw createError({
        statusCode: 409,
        statusMessage:
          'Context changed elsewhere. Reload it before editing again.',
      })
    const next = (value.context as string).trim()
    tx.update(target, id, {
      context: next,
      updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
    })
    return { context: next }
  })
}
