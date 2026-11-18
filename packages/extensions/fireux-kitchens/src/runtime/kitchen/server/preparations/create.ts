import { createError, type H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import {
  requireKitchenIngredientReferences,
  requireKitchenRecipeReference,
} from '../core/preparation-references'
import { readPrepItemCreateInput } from './create-input'

export async function createKitchenPrepItem(event: H3Event, input: unknown) {
  const { kitchenId, id, payload } = readPrepItemCreateInput(input)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenRecordMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const target = defineFirestoreMutationTarget({
      key: 'kitchens.prep-items',
      lane: 'server',
      verbs: ['create'],
      database: { kind: 'runtime' },
      collectionPath: `kitchens/${kitchenId}/prep-items`,
    })
    if ((await tx.read(target, id)).exists)
      throw createError({
        statusCode: 409,
        statusMessage: 'Prep Item already exists.',
      })
    await requireKitchenIngredientReferences(
      tx,
      kitchenId,
      payload.inputs.map((row) => row.ingredient_id)
    )
    await requireKitchenRecipeReference(tx, kitchenId, payload.recipe_id)
    const stamp = serverAuditStamp({
      by: actor.uid,
      appId: authority.ownerAppId,
    })
    tx.create(target, id, { ...payload, created: stamp, updated: stamp })
    return { id }
  })
}
