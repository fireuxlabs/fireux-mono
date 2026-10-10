import type { H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { recipeFields, recipeTarget } from './record-input'

/** Delete exactly the selected Recipe document; related records remain independent. */
export async function deleteRecipe(event: H3Event, input: unknown) {
  const value = recipeFields(input, ['kitchenId', 'recipeId'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const recipeId = requireFirestoreDocumentId(value.recipeId, 'Recipe id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      transaction.delete(recipeTarget(kitchenId), recipeId)
      return { id: recipeId }
    }
  )
}
