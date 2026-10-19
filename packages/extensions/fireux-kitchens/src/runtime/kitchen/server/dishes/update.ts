import { normalizeDishPricingPatch } from '../../utils/dish-pricing'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenDishesTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import {
  requireKitchenIngredientReferences,
  requireKitchenPrepItemReferences,
  requireKitchenRecipeReference,
} from '../core/preparation-references'
import { dishCategories, type DishSpec } from '../../models/dish.model'
import { validateDishSpecification } from '../../utils/dish-specification'
import { dishFields, dishText, validateDishInput } from './record-input'

export async function updateDish(event: H3Event, input: unknown) {
  const value = dishFields(input, ['kitchenId', 'dishId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const dishId = requireFirestoreDocumentId(value.dishId, 'Dish id')
  const changes = dishFields(value.changes, [
    'name',
    'slug',
    'description',
    'category',
    'spec',
    'price',
    'price_options',
    'add_ons',
    'bottle_deposit',
  ])
  if (!Object.keys(changes).length)
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide a Dish change.',
    })
  const patch: Record<string, unknown> & { spec?: DishSpec } = {}
  if ('name' in changes) patch.name = dishText(changes.name, true)
  if ('slug' in changes) patch.slug = dishText(changes.slug)
  if ('description' in changes)
    patch.description = dishText(changes.description)
  if ('category' in changes) {
    if (!dishCategories.some((category) => category.value === changes.category))
      throw createError({
        statusCode: 400,
        statusMessage: 'Choose a valid dish category.',
      })
    patch.category = changes.category
  }
  if ('spec' in changes)
    patch.spec = validateDishInput(() =>
      validateDishSpecification(changes.spec)
    )
  const pricing = Object.fromEntries(
    ['price', 'price_options', 'add_ons', 'bottle_deposit']
      .filter((key) => key in changes)
      .map((key) => [key, changes[key]])
  )
  if (Object.keys(pricing).length)
    Object.assign(
      patch,
      validateDishInput(() => normalizeDishPricingPatch(pricing))
    )
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      const target = serverKitchenDishesTarget(kitchenId)
      const existing = await transaction.read(target, dishId)
      if (!existing.exists)
        throw createError({ statusCode: 404, statusMessage: 'Dish not found.' })
      if (existing.data?.kitchen_id !== kitchenId)
        throw createError({
          statusCode: 409,
          statusMessage: 'The stored Dish identity is invalid.',
        })
      if (patch.spec) {
        await requireKitchenIngredientReferences(
          transaction,
          kitchenId,
          patch.spec.ingredients.map((row) => row.ingredient_id)
        )
        await requireKitchenPrepItemReferences(
          transaction,
          kitchenId,
          patch.spec.prep_items.map((row) => row.prep_item_id)
        )
        await Promise.all(
          [...new Set(patch.spec.recipe_ids)].map((id) =>
            requireKitchenRecipeReference(transaction, kitchenId, id)
          )
        )
      }
      transaction.update(target, dishId, {
        ...patch,
        updated: serverAuditStamp({ by: actor.uid }),
      })
      return { id: dishId }
    }
  )
}
