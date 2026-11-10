import type { H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { recipeFields, recipeTarget } from './record-input'
import { requireUnusedKitchenRecipe } from '../core/preparation-references'

/** Delete only an unused Recipe. Retrying after deletion is a successful no-op. */
export async function deleteRecipe(event: H3Event, input: unknown) {
  const value = recipeFields(input, ['kitchenId', 'recipeId'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const recipeId = requireFirestoreDocumentId(value.recipeId, 'Recipe id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      const target = recipeTarget(kitchenId)
      if ((await transaction.read(target, recipeId)).exists) {
        await requireUnusedKitchenRecipe(transaction, kitchenId, recipeId)
        transaction.delete(target, recipeId)
      }
      return { id: recipeId }
    }
  )
}
