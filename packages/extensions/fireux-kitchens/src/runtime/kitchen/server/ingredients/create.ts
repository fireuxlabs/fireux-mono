import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import {
  ingredientCollectionTarget,
  readIngredientLinkInput,
} from './link-input'

import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  isActiveIngredient,
  normalizeIngredient,
} from '../../../ingredient/server/normalize'

export async function createKitchenIngredient(event: H3Event, input: unknown) {
  const { kitchenId, ingredientId } = readIngredientLinkInput(input)
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenRecordMutationAuthority(mutations, actor, kitchenId)
    const links = ingredientCollectionTarget(kitchenId, 'ingredients')
    const [ingredient, existing] = await Promise.all([
      mutations.read(FIRESTORE_MUTATION_TARGETS.ingredients, ingredientId),
      mutations.read(links, ingredientId),
    ])
    if (
      !ingredient.exists ||
      !isActiveIngredient(ingredient.data) ||
      !normalizeIngredient({ id: ingredientId, data: () => ingredient.data })
    )
      throw createError({
        statusCode: 404,
        statusMessage: 'Catalogue ingredient not found.',
      })
    if (existing.exists) {
      if (existing.data?.ingredient_id !== ingredientId)
        throw createError({
          statusCode: 409,
          statusMessage: 'This Kitchen ingredient has a conflicting link.',
        })
      return
    }
    mutations.create(links, ingredientId, {
      ingredient_id: ingredientId,
      created: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
      updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
    })
  })
  return { ok: true as const, kitchenId, ingredientId }
}
