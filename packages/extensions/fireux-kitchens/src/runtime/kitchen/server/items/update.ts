import { FieldValue } from 'firebase-admin/firestore'
import { validateItemReferenceIds } from '../../utils/item-preparation'
import { requireItemPreparationStations } from '../stations/item-references'
import { normalizeItemSellingTerms } from '../../utils/item-pricing'
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
import { validateItemSpecification } from '../../utils/item-specification'
import { itemFields, itemText, validateItemInput } from './record-input'

export async function updateItem(event: H3Event, input: unknown) {
  const value = itemFields(input, ['kitchenId', 'itemId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const itemId = requireFirestoreDocumentId(value.itemId, 'Item id')
  const changes = itemFields(value.changes, [
    'name',
    'slug',
    'description',
    'item_kind',
    'preparation_station_ids',
    'spec',
    'price',
    'currency_code',
    'choice_groups',
  ])
  if (!Object.keys(changes).length)
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide a Item change.',
    })
  const patch: Record<string, unknown> & {
    spec?: ReturnType<typeof validateItemSpecification>
  } = {}
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
  if ('item_kind' in changes) {
    if (changes.item_kind !== 'food' && changes.item_kind !== 'drink')
      throw createError({
        statusCode: 400,
        statusMessage: 'Choose food or drink.',
      })
    patch.item_kind = changes.item_kind
  }
  if ('spec' in changes)
    patch.spec = validateItemInput(() =>
      validateItemSpecification(changes.spec)
    )
  const pricing = Object.fromEntries(
    ['price', 'currency_code', 'choice_groups']
      .filter((key) => key in changes)
      .map((key) => [key, changes[key]])
  )
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      const target = serverKitchenItemsTarget(kitchenId)
      const existing = await transaction.read(target, itemId)
      if (!existing.exists)
        throw createError({ statusCode: 404, statusMessage: 'Item not found.' })
      if (
        existing.data?.kitchen_id != null &&
        existing.data.kitchen_id !== kitchenId
      )
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
      const pricingPatch: Record<string, unknown> = {}
      if (Object.keys(pricing).length) {
        const stored = existing.data ?? {}
        const terms = validateItemInput(() =>
          normalizeItemSellingTerms(pricing, stored)
        )
        Object.assign(pricingPatch, terms)
        for (const field of ['price', 'currency_code']) {
          if (Object.hasOwn(stored, field) && !Object.hasOwn(terms, field))
            pricingPatch[field] = FieldValue.delete()
        }
      }
      transaction.update(target, itemId, {
        ...patch,
        ...pricingPatch,
        updated: serverAuditStamp({ by: actor.uid }),
      })
      return { id: itemId }
    }
  )
}
