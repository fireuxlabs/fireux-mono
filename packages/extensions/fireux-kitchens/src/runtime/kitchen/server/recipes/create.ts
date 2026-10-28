import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { requireRecipePreparationReferences } from '../core/preparation-references'
import { readRecipeUpdate } from '../../utils/recipe-update-input'
import { normalizeTranslatedText } from '../../utils/recipe'
import { validateRecipePreparation } from '../../utils/recipe-preparation'
import { recipeFields, recipeTarget, validateRecipeInput } from './record-input'

export async function createRecipe(event: H3Event, input: unknown) {
  const value = recipeFields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const draft = recipeFields(value.draft, [
    'name',
    'description',
    'names',
    'descriptions',
    'preparation',
    'source_language',
  ])
  if (
    typeof draft.source_language !== 'string' ||
    !draft.source_language.trim()
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Recipe source language is required.',
    })
  const sourceLanguage = draft.source_language.trim()
  const { source_language: _, ...editable } = draft
  const patch = validateRecipeInput(() =>
    readRecipeUpdate({
      ...editable,
      description: draft.description === undefined ? '' : draft.description,
      names: draft.names === undefined ? {} : draft.names,
      descriptions: draft.descriptions === undefined ? {} : draft.descriptions,
    })
  )
  if (!patch.name)
    throw createError({
      statusCode: 400,
      statusMessage: 'Recipe name is required.',
    })
  const id = requireFirestoreDocumentId(normalizeSlug(patch.name), 'Recipe id')
  const preparation = validateRecipeInput(() =>
    validateRecipePreparation(draft.preparation)
  )
  const payload = {
    ...patch,
    preparation,
    names: normalizeTranslatedText(patch.names),
    descriptions: normalizeTranslatedText(patch.descriptions),
    slug: id,
    kitchen_id: kitchenId,
    source_language: sourceLanguage,
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
      const target = recipeTarget(kitchenId)
      if ((await transaction.read(target, id)).exists)
        throw createError({
          statusCode: 409,
          statusMessage: 'Recipe already exists.',
        })
      await requireRecipePreparationReferences(
        transaction,
        kitchenId,
        preparation
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
