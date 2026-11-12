import { validateItemReferenceIds } from '../../utils/item-preparation'
import { requireItemPreparationStations } from '../stations/item-references'
import { normalizeItemPricingPatch } from '../../utils/item-pricing'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenItemsTarget } from '../mutation-targets'
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
import type { ItemSpec } from '../../models/item.model'
import { validateItemSpecification } from '../../utils/item-specification'
import { itemFields, itemText, validateItemInput } from './record-input'

export async function updateItem(event: H3Event, input: unknown) {
  const value = itemFields(input, ['kitchenId', 'dishId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const dishId = requireFirestoreDocumentId(value.dishId, 'Item id')
  const changes = itemFields(value.changes, [
    'name',
    'slug',
    'description',
    'category',
    'preparation_station_ids',
    'spec',
    'price',
    'price_options',
    'add_ons',
    'bottle_deposit',
    'choice_groups',
  ])
  if (!Object.keys(changes).length)
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide a Item change.',
    })
  const patch: Record<string, unknown> & { spec?: ItemSpec } = {}
  for (const key of ['preparation_station_ids']) {
    if (key in changes)
      patch[key] =
        key === 'preparation_station_ids' && changes[key] === null
          ? null
          : validateItemInput(() => validateItemReferenceIds(changes[key]))
  }
  if ('name' in changes) patch.name = itemText(changes.name, true)
  if ('slug' in changes) patch.slug = itemText(changes.slug)
  if ('description' in changes)
    patch.description = itemText(changes.description)
  if ('category' in changes) patch.category = itemText(changes.category)
  if ('spec' in changes)
    patch.spec = validateItemInput(() =>
      validateItemSpecification(changes.spec)
    )
  const pricing = Object.fromEntries(
    ['price', 'price_options', 'add_ons', 'bottle_deposit', 'choice_groups']
      .filter((key) => key in changes)
      .map((key) => [key, changes[key]])
  )
  if (Object.keys(pricing).length)
    Object.assign(
      patch,
      validateItemInput(() => normalizeItemPricingPatch(pricing))
    )
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      const target = serverKitchenItemsTarget(kitchenId)
      const existing = await transaction.read(target, dishId)
      if (!existing.exists)
        throw createError({ statusCode: 404, statusMessage: 'Item not found.' })
      if (existing.data?.kitchen_id !== kitchenId)
        throw createError({
          statusCode: 409,
          statusMessage: 'The stored Item identity is invalid.',
        })
      if ((patch.preparation_station_ids as string[] | undefined)?.length)
        await requireItemPreparationStations(
          transaction,
          kitchenId,
          patch as { preparation_station_ids?: string[] }
        )
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
