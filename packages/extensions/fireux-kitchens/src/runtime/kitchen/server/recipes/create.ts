import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { readRecipeChanges } from '../../recipe/changes'
import { requireRecipeDefinitionReferences } from '../../recipe/server/references'
import { recipeFields, recipeTarget, validateRecipeInput } from './record-input'

export async function createRecipe(event: H3Event, input: unknown) {
  const value = recipeFields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const patch = validateRecipeInput(() => readRecipeChanges(value.draft))
  if (!patch.name)
    throw createError({
      statusCode: 400,
      statusMessage: 'Recipe name is required.',
    })
  const id = requireFirestoreDocumentId(normalizeSlug(patch.name), 'Recipe id')
  const payload = { inputs: [], method: [], ...patch }
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      const authority = await requireKitchenRecordMutationAuthority(
        transaction,
        actor,
        kitchenId
      )
      const target = recipeTarget(kitchenId)
      if ((await transaction.read(target, id)).exists)
        throw createError({
          statusCode: 409,
          statusMessage: 'Recipe already exists.',
        })
      await requireRecipeDefinitionReferences(
        transaction,
        kitchenId,
        payload,
        {}
      )
      const stamp = serverAuditStamp({
        by: actor.uid,
        appId: authority.ownerAppId,
      })
      transaction.create(target, id, {
        ...payload,
        created: stamp,
        updated: stamp,
      })
      return { id }
    }
  )
}
