import { createError, type H3Event } from 'h3'
import { readItemUsage } from './usage'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenItemsTarget } from '../mutation-targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { itemFields } from './record-input'

export async function deleteItem(event: H3Event, input: unknown) {
  const value = itemFields(input, ['kitchenId', 'dishId'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const dishId = requireFirestoreDocumentId(value.dishId, 'Item id')
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      const usages = await readItemUsage(transaction, kitchenId, dishId)
      if (usages.length)
        throw createError({
          statusCode: 409,
          statusMessage:
            'Remove this Item from its Menus and Promotions before deleting it.',
          data: { usages },
        })
      transaction.delete(serverKitchenItemsTarget(kitchenId), dishId)
      return { id: dishId }
    }
  )
}
