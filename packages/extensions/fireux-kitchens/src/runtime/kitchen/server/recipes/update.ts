import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { requireRecipePreparationReferences } from '../core/preparation-references'
import {
  readRecipeUpdate,
  mergeRecipeUpdate,
} from '../../utils/recipe-update-input'
import { recipeFields, recipeTarget, validateRecipeInput } from './record-input'
import { readRecipeChanges } from '../../recipe/changes'
import { requireRecipeDefinitionReferences } from '../../recipe/server/references'

export async function updateRecipe(event: H3Event, input: unknown) {
  const value = recipeFields(input, ['kitchenId', 'recipeId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const recipeId = requireFirestoreDocumentId(value.recipeId, 'Recipe id')
  const changeRecord =
    value.changes && typeof value.changes === 'object'
      ? (value.changes as Record<string, unknown>)
      : {}
  const canonical =
    ['inputs', 'method', 'yield', 'output_preparation_id', 'source'].some(
      (key) => key in changeRecord
    ) ||
    !['names', 'descriptions', 'preparation'].some((key) => key in changeRecord)
  const patch = validateRecipeInput(() =>
    canonical
      ? readRecipeChanges(value.changes)
      : readRecipeUpdate(value.changes)
  )
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
      if (canonical && ('inputs' in patch || 'output_preparation_id' in patch))
        await requireRecipeDefinitionReferences(
          transaction,
          kitchenId,
          patch,
          existing.data ?? {}
        )
      if ('preparation' in patch && patch.preparation)
        await requireRecipePreparationReferences(
          transaction,
          kitchenId,
          patch.preparation
        )
      const changes = canonical
        ? patch
        : mergeRecipeUpdate(existing.data ?? {}, patch)
      transaction.update(target, recipeId, {
        ...changes,
        updated: serverAuditStamp({ by: actor.uid }),
      })
      return { id: recipeId }
    }
  )
}
