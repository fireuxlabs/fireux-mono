import { normalizeDishPricingPatch } from '../../utils/dish-pricing'
import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenDishesTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { dishFields, dishText } from './record-input'

export async function createDish(event: H3Event, input: unknown) {
  const value = dishFields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const draft = dishFields(value.draft, [
    'name',
    'description',
    'item_kind',
    'is_flagship',
    'price',
    'price_options',
    'add_ons',
  ])
  const name = dishText(draft.name, true)
  const id = requireFirestoreDocumentId(normalizeSlug(name), 'Dish id')
  const itemKind = draft.item_kind === undefined ? 'food' : draft.item_kind
  if (itemKind !== 'food' && itemKind !== 'drink')
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose food or drink.',
    })
  for (const key of ['is_flagship'])
    if (draft[key] !== undefined && typeof draft[key] !== 'boolean')
      throw createError({
        statusCode: 400,
        statusMessage: 'Dish flags must be booleans.',
      })
  const description = dishText(
    draft.description === undefined ? '' : draft.description
  )
  const pricing = normalizeDishPricingPatch({
    price: draft.price ?? 0,
    price_options: draft.price_options ?? [],
    add_ons: draft.add_ons ?? [],
  })
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      const authority = await requireKitchenRecordMutationAuthority(
        transaction,
        actor,
        kitchenId
      )
      const target = serverKitchenDishesTarget(kitchenId)
      if ((await transaction.read(target, id)).exists)
        throw createError({
          statusCode: 409,
          statusMessage: 'Dish already exists.',
        })
      const stamp = serverAuditStamp({
        by: actor.uid,
        appId: authority.ownerAppId,
      })
      transaction.create(target, id, {
        name,
        ...pricing,
        slug: id,
        description,
        item_kind: itemKind,
        // Flagship selection remains a separate trusted action.
        is_flagship: false,
        image: '',
        kitchen_id: kitchenId,
        created: stamp,
        updated: stamp,
      })
      return { id }
    }
  )
}
