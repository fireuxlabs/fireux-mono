import type { Transaction } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_KINDS,
  INGREDIENT_STATUSES,
  type IngredientCategory,
  type IngredientKind,
  type IngredientStatus,
} from '../../models/ingredient-taxonomy.ts'
import {
  aliases,
  assertLifecycle,
  badRequest,
  enumValue,
  foldIdentity,
  imageUrl,
  MAX_LIBRARY_SIZE,
  optionalIngredientId,
  requiredName,
  type StoredRecord,
  text,
} from './curation-input'
import {
  normalizeIngredientAliases,
  projectPublicIngredient,
} from './public-projection.ts'

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
    'Ingredient category',
    'other'
  )
  const kind = enumValue<IngredientKind>(
    Object.hasOwn(patch, 'kind') ? patch.kind : source.kind,
    INGREDIENT_KINDS,
    'Ingredient kind',
    'base'
  )
  const status = enumValue<IngredientStatus>(
    Object.hasOwn(patch, 'status') ? patch.status : source.status,
    INGREDIENT_STATUSES,
    'Ingredient status',
    'active'
  )
  const parentIngredientId = optionalIngredientId(
    Object.hasOwn(patch, 'parent_ingredient_id')
      ? patch.parent_ingredient_id
      : source.parent_ingredient_id,
    'Parent Ingredient id'
  )
  const replacedByIngredientId = optionalIngredientId(
    Object.hasOwn(patch, 'replaced_by_ingredient_id')
      ? patch.replaced_by_ingredient_id
      : source.replaced_by_ingredient_id,
    'Replacement Ingredient id'
  )
  assertLifecycle({
    id,
    parentIngredientId,
    status,
    replacedByIngredientId,
  })
  const canonicalImageUrl = imageUrl(
    Object.hasOwn(patch, 'image_url') ? patch.image_url : source.image_url
  )
  if (status === 'active' && !canonicalImageUrl) {
    badRequest('An active Ingredient requires an image.')
  }

  return {
    id,
    schema_version: 2,
    name,
    aliases: aliases(
      Object.hasOwn(patch, 'aliases') ? patch.aliases : source.aliases,
      name
    ),
    slug: text(source.slug) || id,
    category,
    kind,
    ...(parentIngredientId ? { parent_ingredient_id: parentIngredientId } : {}),
    status,
    ...(replacedByIngredientId
      ? { replaced_by_ingredient_id: replacedByIngredientId }
      : {}),
    image_url: canonicalImageUrl,
    created: stamp.created ?? source.created,
    updated: stamp.updated,
  }
}

export async function assertUniqueActiveIngredientIdentity(
  transaction: Transaction,
  id: string,
  payload: StoredRecord
) {
  if (text(payload.status) !== 'active') return

  const snapshot = await transaction.get(
    getRuntimeFirestore()
      .collection('ingredients')
      .limit(MAX_LIBRARY_SIZE + 1)
  )
  if (snapshot.size > MAX_LIBRARY_SIZE) {
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

  for (const document of snapshot.docs) {
    if (document.id === id) continue
    const ingredient = projectPublicIngredient(document)
    if (!ingredient || ingredient.status !== 'active') continue

    const conflictingTerm = [ingredient.name, ...ingredient.aliases]
      .map(foldIdentity)
      .find((term) => candidateTerms.has(term))
    if (!conflictingTerm) continue

    throw createError({
      statusCode: 409,
      statusMessage: `Ingredient identity conflicts with active Ingredient ${ingredient.id}.`,
    })
  }
}

export async function assertReferencedIngredients(
  transaction: Transaction,
  id: string,
  payload: StoredRecord
) {
  const db = getRuntimeFirestore()
  const replacementId = text(payload.replaced_by_ingredient_id)
  if (replacementId) {
    const snapshot = await transaction.get(
      db.doc(`ingredients/${replacementId}`)
    )
    const projected = projectPublicIngredient(snapshot)
    if (!projected || projected.status !== 'active') {
      throw createError({
        statusCode: 409,
        statusMessage: `Ingredient ${id} references a missing or inactive replacement.`,
      })
    }
  }

  let parentId = text(payload.parent_ingredient_id)
  const visited = new Set([id])
  for (let depth = 0; parentId; depth += 1) {
    if (depth >= 50 || visited.has(parentId)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Ingredient ${id} would create a parent cycle.`,
      })
    }
    visited.add(parentId)
    const snapshot = await transaction.get(db.doc(`ingredients/${parentId}`))
    const projected = projectPublicIngredient(snapshot)
    if (!projected || projected.status !== 'active') {
      throw createError({
        statusCode: 409,
        statusMessage: `Ingredient ${id} references a missing or inactive parent.`,
      })
    }
    parentId = projected.parent_ingredient_id || ''
  }
}
