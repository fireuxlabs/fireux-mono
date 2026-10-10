import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { Ingredient } from '../models/ingredient.model'
import { assertCurator, curatorContext } from './curation-authority'
import { badRequest, normalizeIngredientInput } from './curation-input'
import {
  assertUniqueActiveIngredientIdentity,
  canonicalStoredIngredient,
} from './curation-storage'
import { normalizeIngredient } from './normalize'

import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

export async function createIngredient(
  event: H3Event,
  input: unknown
): Promise<Ingredient> {
  const source = normalizeIngredientInput(input, true)
  const name = source.name as string
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
        payload,
        true
      )
      mutations.create(ingredients, id, { ...payload, status: 'active' })
      return payload
    }
  )

  const ingredient = normalizeIngredient({ id, data: () => result })
  if (!ingredient) throw new Error('Created Ingredient is invalid.')
  return ingredient
}
