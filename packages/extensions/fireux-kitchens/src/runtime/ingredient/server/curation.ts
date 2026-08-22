import { createError, type H3Event } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  Ingredient,
  IngredientCreateInput,
  IngredientUpdateInput,
} from '../utils/ingredient.ts'
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
import { normalizeIngredient } from './normalize.ts'

export async function createIngredient(
  event: H3Event,
  input: Partial<IngredientCreateInput> | unknown
): Promise<Ingredient> {
  const source = validateObject(input, CREATE_FIELDS, 'Ingredient')
  const name = requiredName(source.name)
  const id = normalizeSlug(name, { maxLength: 120 })
  if (!isFirestoreDocumentId(id)) badRequest('Unable to resolve Ingredient id.')

  const context = await curatorContext(event)
  const ingredients = FIRESTORE_MUTATION_TARGETS.ingredients
  const memberships = serverAppUsersTarget(context.appId)

  const result = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const [existing, membership] = await Promise.all([
        mutations.read(ingredients, id),
        mutations.read(memberships, context.uid),
      ])
      assertCurator(membership.data, context.isDeveloper)
      if (existing.exists) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Ingredient already exists.',
        })
      }

      const payload = canonicalStoredIngredient(
        id,
        { slug: id, name },
        source,
        {
          created: serverAuditStamp({ by: context.uid, appId: context.appId }),
          updated: serverAuditStamp({ by: context.uid }),
        }
      )
      await assertUniqueActiveIngredientIdentity(
        mutations,
        ingredients,
        id,
        payload
      )
      await assertReferencedIngredients(mutations, ingredients, id, payload)
      mutations.create(ingredients, id, payload)
      return payload
    }
  )

  const ingredient = normalizeIngredient({ id, data: () => result })
  if (!ingredient) throw new Error('Created Ingredient is invalid.')
  return ingredient
}

export async function updateIngredient(
  event: H3Event,
  ingredientId: string,
  input: Partial<IngredientUpdateInput> | unknown
): Promise<Ingredient> {
  const id = text(ingredientId)
  if (!isFirestoreDocumentId(id)) badRequest('Ingredient id is invalid.')
  const patch = validateObject(input, UPDATE_FIELDS, 'Ingredient patch')
  if (!Object.keys(patch).length) badRequest('Ingredient patch is empty.')

  const context = await curatorContext(event)
  const ingredients = FIRESTORE_MUTATION_TARGETS.ingredients
  const memberships = serverAppUsersTarget(context.appId)

  const result = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const [existing, membership] = await Promise.all([
        mutations.read<DocumentData>(ingredients, id),
        mutations.read(memberships, context.uid),
      ])
      assertCurator(membership.data, context.isDeveloper)
      if (!existing.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Ingredient not found.',
        })
      }

      const payload = canonicalStoredIngredient(
        id,
        record(existing.data),
        patch,
        { updated: serverAuditStamp({ by: context.uid }) }
      )
      await assertUniqueActiveIngredientIdentity(
        mutations,
        ingredients,
        id,
        payload
      )
      await assertReferencedIngredients(mutations, ingredients, id, payload)
      const replacement: DocumentData = { ...payload }
      // Retain the legacy redundant id until its protected cleanup has a
      // retained export/preimage. New Ingredient documents do not store it.
      if (Object.hasOwn(existing.data || {}, 'id')) replacement.id = id
      for (const field of Object.keys(existing.data || {})) {
        if (!Object.hasOwn(payload, field))
          replacement[field] = FieldValue.delete()
      }
      mutations.update<DocumentData>(ingredients, id, replacement)
      return payload
    }
  )

  const ingredient = normalizeIngredient({ id, data: () => result })
  if (!ingredient) throw new Error('Updated Ingredient is invalid.')
  return ingredient
}

export async function listIngredientsForCurator(
  event: H3Event
): Promise<Ingredient[]> {
  const context = await curatorContext(event)
  const db = getRuntimeFirestore()
  const membership = await db
    .doc(`apps/${context.appId}/users/${context.uid}`)
    .get()
  assertCurator(membership.data(), context.isDeveloper)

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
    .map(normalizeIngredient)
    .filter((item): item is Ingredient => Boolean(item))
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    )
}
