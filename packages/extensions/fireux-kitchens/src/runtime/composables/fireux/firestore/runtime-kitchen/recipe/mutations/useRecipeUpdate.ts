import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, unref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
    normalizePublishedRecipeSummary,
    normalizeRecipeAccessPolicy,
    normalizeRecipeIngredientLines,
    normalizeRecipeSteps,
    type Recipe,
    type RecipeUpdateInput,
} from '../../../../../../models/recipe.model'
import { useKitchenSelection } from '../../../../app/kitchen-console/useKitchenSelection'
import { resolveKitchenConsoleCollectionPath } from '../../../../app/kitchen-console/shared'

const trim = (value: unknown) => String(value || '').trim()
const optional = (value: unknown) => {
  const resolved = trim(value)
  return resolved || undefined
}
const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((entry) => trim(entry)).filter(Boolean)
    : []

export function useRecipeUpdate(options: { kitchenCollectionPath?: string | Ref<string | null | undefined> } = {}) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()
  const { runtimeKitchenId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || '').trim() ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const updateRecipe = async (
    recipeId: string,
    patch: Partial<RecipeUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string } = {}
  ) => {
    const resolvedRecipeId = trim(recipeId)
    if (!resolvedRecipeId) throw new Error('Recipe id is required')

    const kitchenId = trim(overrides.kitchenId || runtimeKitchenId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const next: Partial<Recipe> & Record<string, unknown> = { ...patch }

    if ('status' in next && !('workflow_status' in next)) {
      next.workflow_status = next.status as Recipe['workflow_status']
      delete next.status
    }

    if ('dish_id' in next && !('primary_dish_id' in next)) {
      next.primary_dish_id = next.dish_id as string
      delete next.dish_id
    }

    if ('ingredient_lines' in next) {
      next.ingredient_lines = normalizeRecipeIngredientLines(next.ingredient_lines)
    }

    if ('steps' in next) {
      next.steps = normalizeRecipeSteps(next.steps)
    }

    if ('access_policy' in next) {
      next.access_policy = normalizeRecipeAccessPolicy(next.access_policy)
    }

    if ('published_summary' in next) {
      next.published_summary = normalizePublishedRecipeSummary(next.published_summary)
    }

    if ('tags' in next) next.tags = stringArray(next.tags)
    if ('cuisine_types' in next) next.cuisine_types = stringArray(next.cuisine_types)
    if ('dietary_flags' in next) next.dietary_flags = stringArray(next.dietary_flags)
    if ('slug' in next) next.slug = optional(next.slug)
    if ('notes' in next) next.notes = optional(next.notes)
    if ('primary_dish_id' in next) next.primary_dish_id = optional(next.primary_dish_id)
    if ('source_recipe_id' in next) next.source_recipe_id = optional(next.source_recipe_id)
    if ('source_kitchen_id' in next) next.source_kitchen_id = optional(next.source_kitchen_id)

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/recipes`
    await updateDocument<Recipe>(collectionPath, resolvedRecipeId, next)
  }

  return { updateRecipe }
}
