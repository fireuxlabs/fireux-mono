import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import type {
  IngredientCreateInput,
  IngredientUpdateInput,
} from '../../models/ingredient.model.ts'
import type { PublicIngredient } from '../../models/ingredient-public.model.ts'
import { assertCurator, curatorContext } from './curation-authority'
import {
  CREATE_FIELDS,
  MAX_LIBRARY_SIZE,
  UPDATE_FIELDS,
  badRequest,
  record,
  requiredName,
  text,
  validateObject,
} from './curation-input'
import {
  assertReferencedIngredients,
  assertUniqueActiveIngredientIdentity,
  canonicalStoredIngredient,
} from './curation-storage'
import { projectPublicIngredient } from './public-projection.ts'

export async function createIngredient(
  event: H3Event,
  input: Partial<IngredientCreateInput> | unknown
): Promise<PublicIngredient> {
  const source = validateObject(input, CREATE_FIELDS, 'Ingredient')
  const name = requiredName(source.name)
  const id = normalizeSlug(name, { maxLength: 120 })
  if (!isFirestoreDocumentId(id)) badRequest('Unable to resolve Ingredient id.')

  const context = await curatorContext(event)
  const db = getRuntimeFirestore()
  const ref = db.doc(`ingredients/${id}`)
  const membershipRef = db.doc(`apps/${context.appId}/users/${context.uid}`)

  const result = await db.runTransaction(async (transaction) => {
    const [existing, membership] = await Promise.all([
      transaction.get(ref),
      transaction.get(membershipRef),
    ])
    assertCurator(membership, context.isDeveloper)
    if (existing.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ingredient already exists.',
      })
    }

    const payload = canonicalStoredIngredient(id, { slug: id, name }, source, {
      created: serverAuditStamp({ by: context.uid, appId: context.appId }),
      updated: serverAuditStamp({ by: context.uid }),
    })
    await assertUniqueActiveIngredientIdentity(transaction, id, payload)
    await assertReferencedIngredients(transaction, id, payload)
    transaction.create(ref, payload)
    return payload
  })

  const projected = projectPublicIngredient({ id, data: () => result })
  if (!projected) throw new Error('Created Ingredient projection is invalid.')
  return projected
}

export async function updateIngredient(
  event: H3Event,
  ingredientId: string,
  input: Partial<IngredientUpdateInput> | unknown
): Promise<PublicIngredient> {
  const id = text(ingredientId)
  if (!isFirestoreDocumentId(id)) badRequest('Ingredient id is invalid.')
  const patch = validateObject(input, UPDATE_FIELDS, 'Ingredient patch')
  if (!Object.keys(patch).length) badRequest('Ingredient patch is empty.')

  const context = await curatorContext(event)
  const db = getRuntimeFirestore()
  const ref = db.doc(`ingredients/${id}`)
  const membershipRef = db.doc(`apps/${context.appId}/users/${context.uid}`)

  const result = await db.runTransaction(async (transaction) => {
    const [existing, membership] = await Promise.all([
      transaction.get(ref),
      transaction.get(membershipRef),
    ])
    assertCurator(membership, context.isDeveloper)
    if (!existing.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ingredient not found.',
      })
    }

    const payload = canonicalStoredIngredient(
      id,
      record(existing.data()),
      patch,
      { updated: serverAuditStamp({ by: context.uid }) }
    )
    await assertUniqueActiveIngredientIdentity(transaction, id, payload)
    await assertReferencedIngredients(transaction, id, payload)
    transaction.set(ref, payload)
    return payload
  })

  const projected = projectPublicIngredient({ id, data: () => result })
  if (!projected) throw new Error('Updated Ingredient projection is invalid.')
  return projected
}

export async function listIngredientsForCurator(
  event: H3Event
): Promise<PublicIngredient[]> {
  const context = await curatorContext(event)
  const db = getRuntimeFirestore()
  const membership = await db
    .doc(`apps/${context.appId}/users/${context.uid}`)
    .get()
  assertCurator(membership, context.isDeveloper)

  const snapshot = await db
    .collection('ingredients')
    .limit(MAX_LIBRARY_SIZE + 1)
    .get()
  if (snapshot.size > MAX_LIBRARY_SIZE) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Ingredient library exceeds the bounded curator index.',
    })
  }

  return snapshot.docs
    .map(projectPublicIngredient)
    .filter((item): item is PublicIngredient => Boolean(item))
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    )
}
