import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

export function ingredientCollectionTarget(
  kitchenId: string,
  collection: string
) {
  return defineFirestoreMutationTarget({
    key: `kitchens.${collection}`,
    lane: 'server',
    // Guarded targets require a mutation verb even for read-only use here.
    verbs: collection === 'ingredients' ? ['create', 'delete'] : ['create'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/${collection}`,
  })
}

export function readIngredientLinkInput(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a Kitchen and ingredient.',
    })
  const body = input as Record<string, unknown>
  if (
    Object.keys(body).some(
      (key) => !['kitchenId', 'ingredientId'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported ingredient field.',
    })
  return {
    kitchenId: requireFirestoreDocumentId(body.kitchenId, 'Kitchen id'),
    ingredientId: requireFirestoreDocumentId(
      body.ingredientId,
      'Ingredient id'
    ),
  }
}
