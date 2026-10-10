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

export async function deleteKitchenIngredient(event: H3Event, input: unknown) {
  const { kitchenId, ingredientId } = readIngredientLinkInput(input)
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenRecordMutationAuthority(mutations, actor, kitchenId)
    const links = ingredientCollectionTarget(kitchenId, 'ingredients')
    const link = await mutations.read(links, ingredientId)
    if (!link.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen ingredient not found.',
      })
    if (link.data?.ingredient_id !== ingredientId)
      throw createError({
        statusCode: 409,
        statusMessage: 'This Kitchen ingredient has a conflicting link.',
      })
    // Read every page before deleting. References retain the canonical ingredient id.
    for (const collection of [
      'recipes',
      'dishes',
      'prep-items',
      'supplier-ingredients',
    ]) {
      let afterId: string | undefined
      for (;;) {
        const rows = await mutations.readAll(
          ingredientCollectionTarget(kitchenId, collection),
          100,
          afterId
        )
        const used = rows.some(({ data }) => {
          const inputs =
            collection === 'recipes'
              ? data.preparation?.ingredients
              : collection === 'dishes'
                ? data.spec?.ingredients
                : collection === 'prep-items'
                  ? data.inputs
                  : [data]
          return (
            Array.isArray(inputs) &&
            inputs.some((row) => row?.ingredient_id === ingredientId)
          )
        })
        if (used)
          throw createError({
            statusCode: 409,
            statusMessage: `This ingredient is still used in ${collection}. Remove those links first.`,
          })
        if (rows.length < 100) break
        afterId = rows.at(-1)!.id
      }
    }
    mutations.delete(links, ingredientId)
  })
  return { ok: true as const, kitchenId, ingredientId }
}
