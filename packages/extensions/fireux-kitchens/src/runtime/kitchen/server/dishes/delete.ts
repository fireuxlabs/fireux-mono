import type { H3Event } from 'h3'
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
      // Preserve document-only, idempotent deletion without a cascade policy.
      transaction.delete(serverKitchenDishesTarget(kitchenId), dishId)
      return { id: dishId }
    }
  )
}
