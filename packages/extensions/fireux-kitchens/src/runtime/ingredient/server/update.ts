import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { INGREDIENT_MUTATION_TARGETS } from './mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import type { Ingredient } from '../models/ingredient.model'
import { assertCurator, curatorContext } from './curation-authority'
import { badRequest, normalizeIngredientInput } from './curation-input'
import {
  assertUniqueActiveIngredientIdentity,
  canonicalStoredIngredient,
} from './curation-storage'
import { normalizeIngredient } from './normalize'

import type { DocumentData } from 'firebase-admin/firestore'
import { record, text } from './curation-input'

export async function updateIngredient(
  event: H3Event,
  ingredientId: string,
  input: unknown
): Promise<Ingredient> {
  const id = text(ingredientId)
  if (!isFirestoreDocumentId(id)) badRequest('Ingredient id is invalid.')
  const patch = normalizeIngredientInput(input)

  const context = await curatorContext(event)
  const ingredients = INGREDIENT_MUTATION_TARGETS.ingredients
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
      // Patch identity only. Historical retirement/merge metadata is preserved.
      mutations.update<DocumentData>(ingredients, id, payload)
      return payload
    }
  )

  const ingredient = normalizeIngredient({ id, data: () => result })
  if (!ingredient) throw new Error('Updated Ingredient is invalid.')
  return ingredient
}
