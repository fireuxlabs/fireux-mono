import { createError, type H3Event } from 'h3'
import { readDishUsage } from './usage'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenDishesTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { dishFields } from './record-input'

export async function deleteDish(event: H3Event, input: unknown) {
  const value = dishFields(input, ['kitchenId', 'dishId'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const dishId = requireFirestoreDocumentId(value.dishId, 'Dish id')
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      const usages = await readDishUsage(transaction, kitchenId, dishId)
      if (usages.length)
        throw createError({
          statusCode: 409,
          statusMessage: 'Remove this Dish from its Menus and Promotions before deleting it.',
          data: { usages },
        })
      transaction.delete(serverKitchenDishesTarget(kitchenId), dishId)
      return { id: dishId }
    }
  )
}
