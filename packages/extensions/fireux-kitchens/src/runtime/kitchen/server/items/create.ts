import { validateItemReferenceIds } from '../../utils/item-preparation'
import { requireItemPreparationStations } from '../stations/item-references'
import { normalizeItemPricingPatch } from '../../utils/item-pricing'
import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenItemsTarget } from '../mutation-targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { itemFields, itemText, validateItemInput } from './record-input'

export async function createItem(event: H3Event, input: unknown) {
  const value = itemFields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const draft = itemFields(value.draft, [
    'name',
    'description',
    'item_kind',
    'preparation_station_ids',
    'is_flagship',
    'price',
    'price_options',
    'add_ons',
    'bottle_deposit',
    'choice_groups',
  ])
  const name = itemText(draft.name, true)
  const id = requireFirestoreDocumentId(normalizeSlug(name), 'Item id')
  const itemKind = draft.item_kind
  if (itemKind !== undefined && itemKind !== 'food' && itemKind !== 'drink')
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose food or drink.',
    })
  for (const key of ['is_flagship'])
    if (draft[key] !== undefined && typeof draft[key] !== 'boolean')
      throw createError({
        statusCode: 400,
        statusMessage: 'Item flags must be booleans.',
      })
  const description = itemText(
    draft.description === undefined ? '' : draft.description
  )
  const pricing = validateItemInput(() =>
    normalizeItemPricingPatch({
      ...(Object.hasOwn(draft, 'price') ? { price: draft.price } : {}),
      ...(Object.hasOwn(draft, 'choice_groups')
        ? { choice_groups: draft.choice_groups }
        : {}),
      price_options: draft.price_options ?? [],
      add_ons: draft.add_ons ?? [],
      ...(draft.bottle_deposit !== undefined
        ? { bottle_deposit: draft.bottle_deposit }
        : {}),
    })
  )
  const organisation = {
    ...(draft.preparation_station_ids !== undefined
      ? {
          preparation_station_ids: validateItemInput(() =>
            validateItemReferenceIds(draft.preparation_station_ids)
          ),
        }
      : {}),
  }
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      const authority = await requireKitchenRecordMutationAuthority(
        transaction,
        actor,
        kitchenId
      )
      const target = serverKitchenItemsTarget(kitchenId)
      if ((await transaction.read(target, id)).exists)
        throw createError({
          statusCode: 409,
          statusMessage: 'Item already exists.',
        })
      if (organisation.preparation_station_ids?.length)
        await requireItemPreparationStations(
          transaction,
          kitchenId,
          organisation
        )
      const stamp = serverAuditStamp({
        by: actor.uid,
        appId: authority.ownerAppId,
      })
      transaction.create(target, id, {
        name,
        ...pricing,
        slug: id,
        description,
        item_kind: itemKind ?? null,
        ...organisation,
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
