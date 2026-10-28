import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { INGREDIENT_MUTATION_TARGETS } from '../../../ingredient/server/mutation-targets'
import {
  isActiveIngredient,
  normalizeIngredient,
} from '../../../ingredient/server/normalize'
import type { RecipePreparation } from '../../models/recipe-preparation'

function childTarget(
  kitchenId: string,
  collection: 'ingredients' | 'prep-items' | 'recipes'
) {
  return defineFirestoreMutationTarget({
    key: `kitchens.${collection}`,
    lane: 'server',
    verbs: ['create'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/${collection}`,
  })
}

/** Bind purchased inputs to the Kitchen's canonical, readable catalogue associations. */
export async function requireKitchenIngredientReferences(
  transaction: GuardedServerTransaction,
  kitchenId: string,
  ids: string[]
) {
  const links = childTarget(kitchenId, 'ingredients')
  await Promise.all(
    [...new Set(ids)].map(async (id) => {
      const [link, ingredient] = await Promise.all([
        transaction.read(links, id),
        transaction.read(INGREDIENT_MUTATION_TARGETS.ingredients, id),
      ])
      if (
        !link.exists ||
        link.data?.ingredient_id !== id ||
        !ingredient.exists ||
        !isActiveIngredient(ingredient.data) ||
        !normalizeIngredient({ id, data: () => ingredient.data })
      )
        throw createError({
          statusCode: 409,
          statusMessage:
            'An ingredient is unavailable in this Kitchen. Update its ingredient links.',
        })
    })
  )
}

export async function requireRecipePreparationReferences(
  transaction: GuardedServerTransaction,
  kitchenId: string,
  preparation: RecipePreparation
) {
  await requireKitchenIngredientReferences(
    transaction,
    kitchenId,
    preparation.ingredients.map((row) => row.ingredient_id)
  )
  await requireKitchenPrepItemReferences(
    transaction,
    kitchenId,
    preparation.prep_items.map((row) => row.prep_item_id)
  )
}

export async function requireKitchenPrepItemReferences(
  transaction: GuardedServerTransaction,
  kitchenId: string,
  ids: string[]
) {
  const target = childTarget(kitchenId, 'prep-items')
  await Promise.all(
    [...new Set(ids)].map(async (id) => {
      const item = await transaction.read(target, id)
      if (!item.exists || item.data?.kitchen_id !== kitchenId)
        throw createError({
          statusCode: 409,
          statusMessage:
            'A prep item is unavailable in this Kitchen. Update its prep item links.',
        })
    })
  )
}

export async function requireKitchenRecipeReference(
  transaction: GuardedServerTransaction,
  kitchenId: string,
  recipeId: string
) {
  if (!recipeId) return
  const recipe = await transaction.read(
    childTarget(kitchenId, 'recipes'),
    recipeId
  )
  if (!recipe.exists || recipe.data?.kitchen_id !== kitchenId)
    throw createError({
      statusCode: 409,
      statusMessage: 'The recipe is unavailable in this Kitchen.',
    })
}
