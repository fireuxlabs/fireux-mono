import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { recipeFields, recipeTarget, validateRecipeInput } from './record-input'
import { readRecipeChanges } from '../../recipe/changes'
import { requireRecipeDefinitionReferences } from '../../recipe/server/references'

export async function updateRecipe(event: H3Event, input: unknown) {
  const value = recipeFields(input, ['kitchenId', 'recipeId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const recipeId = requireFirestoreDocumentId(value.recipeId, 'Recipe id')
  const patch = validateRecipeInput(() => readRecipeChanges(value.changes))
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenRecordMutationAuthority(transaction, actor, kitchenId)
      const target = recipeTarget(kitchenId)
      const existing = await transaction.read(target, recipeId)
      if (!existing.exists)
        throw createError({
          statusCode: 404,
          statusMessage: 'Recipe not found.',
        })
      if (
        existing.data?.kitchen_id != null &&
        existing.data.kitchen_id !== kitchenId
      )
        throw createError({
          statusCode: 409,
          statusMessage: 'The stored Recipe belongs to another Kitchen.',
        })
      if ('inputs' in patch || 'output_preparation_id' in patch)
        await requireRecipeDefinitionReferences(
          transaction,
          kitchenId,
          patch,
          existing.data ?? {}
        )
      transaction.update(target, recipeId, {
        ...patch,
        updated: serverAuditStamp({ by: actor.uid }),
      })
      return { id: recipeId }
    }
  )
}
