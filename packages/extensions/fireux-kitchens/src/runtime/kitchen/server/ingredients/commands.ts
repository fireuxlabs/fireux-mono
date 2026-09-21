import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'

function target(kitchenId: string, collection: string) {
  return defineFirestoreMutationTarget({
    key: `kitchens.${collection}`,
    lane: 'server',
    // Guarded targets require a mutation verb even for read-only use here.
    verbs: collection === 'ingredients' ? ['create', 'delete'] : ['create'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/${collection}`,
  })
}

function readInput(input: unknown) {
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

export async function createKitchenIngredient(event: H3Event, input: unknown) {
  const { kitchenId, ingredientId } = readInput(input)
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const links = target(kitchenId, 'ingredients')
    const [ingredient, existing] = await Promise.all([
      mutations.read(FIRESTORE_MUTATION_TARGETS.ingredients, ingredientId),
      mutations.read(links, ingredientId),
    ])
    if (!ingredient.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Catalogue ingredient not found.',
      })
    if (existing.exists) {
      if (existing.data?.ingredient_id !== ingredientId)
        throw createError({
          statusCode: 409,
          statusMessage: 'This Kitchen ingredient has a conflicting link.',
        })
      return
    }
    mutations.create(links, ingredientId, {
      ingredient_id: ingredientId,
      created: serverAuditStamp({ by: actor.uid }),
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, ingredientId }
}

export async function deleteKitchenIngredient(event: H3Event, input: unknown) {
  const { kitchenId, ingredientId } = readInput(input)
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const links = target(kitchenId, 'ingredients')
    const link = await mutations.read(links, ingredientId)
    if (!link.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen ingredient not found.',
      })
    if (link.data?.ingredient_id !== ingredientId)
      throw createError({
        statusCode: 409,
        statusMessage: 'This Kitchen ingredient has a conflicting link.',
      })
    // Read every page before deleting. References retain the canonical ingredient id.
    for (const collection of [
      'recipes',
      'dishes',
      'prep-items',
      'supplier-ingredients',
    ]) {
      let afterId: string | undefined
      for (;;) {
        const rows = await mutations.readAll(
          target(kitchenId, collection),
          100,
          afterId
        )
        const used = rows.some(({ data }) => {
          const inputs =
            collection === 'recipes'
              ? data.preparation?.ingredients
              : collection === 'dishes'
                ? data.spec?.ingredients
                : collection === 'prep-items'
                  ? data.inputs
                  : [data]
          return (
            Array.isArray(inputs) &&
            inputs.some((row) => row?.ingredient_id === ingredientId)
          )
        })
        if (used)
          throw createError({
            statusCode: 409,
            statusMessage: `This ingredient is still used in ${collection}. Remove those links first.`,
          })
        if (rows.length < 100) break
        afterId = rows.at(-1)!.id
      }
    }
    mutations.delete(links, ingredientId)
  })
  return { ok: true as const, ingredientId }
}
