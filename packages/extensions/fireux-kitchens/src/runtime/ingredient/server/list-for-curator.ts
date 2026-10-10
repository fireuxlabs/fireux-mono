import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { Ingredient } from '../models/ingredient.model'
import { assertCurator, curatorContext } from './curation-authority'
import { MAX_LIBRARY_SIZE } from './curation-input'
import { normalizeIngredient } from './normalize'

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
