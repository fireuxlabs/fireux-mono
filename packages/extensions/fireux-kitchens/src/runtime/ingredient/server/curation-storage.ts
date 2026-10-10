import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { FirestoreMutationTarget } from 'fireux-core/runtime/types/firestore-mutations'
import {
  INGREDIENT_CATEGORIES,
  type IngredientCategory,
} from '../models/ingredient-taxonomy.ts'
import {
  aliases,
  enumValue,
  foldIdentity,
  imageUrl,
  MAX_LIBRARY_SIZE,
  requiredName,
  type StoredRecord,
  text,
} from './curation-input'
import { normalizeIngredientAliases, isActiveIngredient } from './normalize.ts'

export function canonicalStoredIngredient(
  id: string,
  source: StoredRecord,
  patch: StoredRecord,
  stamp: { created?: unknown; updated: unknown }
) {
  const name = requiredName(
    Object.hasOwn(patch, 'name') ? patch.name : source.name
  )
  const category = enumValue<IngredientCategory>(
    Object.hasOwn(patch, 'category') ? patch.category : source.category,
    INGREDIENT_CATEGORIES,
    'Ingredient category'
  )
  const canonicalImageUrl = imageUrl(
    Object.hasOwn(patch, 'image_url') ? patch.image_url : source.image_url
  )
  return {
    schema_version: 3,
    name,
    aliases: aliases(
      Object.hasOwn(patch, 'aliases') ? patch.aliases : source.aliases,
      name
    ),
    slug: text(source.slug) || id,
    category,
    image_url: canonicalImageUrl,
    created: stamp.created ?? source.created,
    updated: stamp.updated,
  }
}

export async function assertUniqueActiveIngredientIdentity(
  mutations: GuardedServerTransaction,
  ingredients: FirestoreMutationTarget<string, 'server'>,
  id: string,
  payload: StoredRecord,
  creating = false
) {
  if (!isActiveIngredient(payload)) return

  const documents = await mutations.readAll(ingredients, MAX_LIBRARY_SIZE + 1)
  if (creating && documents.length >= MAX_LIBRARY_SIZE)
    throw createError({
      statusCode: 409,
      statusMessage:
        'Ingredient library is full. Curate the existing records before adding another.',
    })
  if (documents.length > MAX_LIBRARY_SIZE) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Ingredient library exceeds the bounded curator check.',
    })
  }

  const candidateTerms = new Set([
    foldIdentity(payload.name),
    ...normalizeIngredientAliases(payload.aliases).map(foldIdentity),
  ])
  candidateTerms.delete('')

  for (const document of documents) {
    if (document.id === id) continue
    const ingredient = document.data
    if (!ingredient || !isActiveIngredient(ingredient)) continue

    const conflictingTerm = [
      text(ingredient.name),
      ...normalizeIngredientAliases(ingredient.aliases),
    ]
      .map(foldIdentity)
      .find((term) => candidateTerms.has(term))
    if (!conflictingTerm) continue

    throw createError({
      statusCode: 409,
      statusMessage: `Ingredient identity conflicts with active Ingredient ${document.id}.`,
    })
  }
}
