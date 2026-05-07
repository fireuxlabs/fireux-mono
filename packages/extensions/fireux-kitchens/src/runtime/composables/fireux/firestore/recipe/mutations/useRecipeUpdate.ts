import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, unref, type Ref } from 'vue'
import {
  normalizeLocalizedText,
  type LocaleCode,
  type Recipe,
  type RecipeUpdateInput,
  type RecipeType,
} from '../../../../../models/recipe.model'
import { resolveKitchenConsoleCollectionPath } from '../../../app/kitchen-console/shared'
import { useKitchenSelection } from '../../../app/kitchen-console/useKitchenSelection'

const trim = (value: unknown) => String(value || '').trim()
const optional = (value: unknown) => trim(value) || undefined

const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T => {
  const resolved = trim(value) as T
  return allowed.includes(resolved) ? resolved : fallback
}

export function useRecipeUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    trim(unref(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const updateRecipe = async (
    recipeId: string,
    patch: Partial<RecipeUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string } = {}
  ) => {
    const resolvedRecipeId = trim(recipeId)
    if (!resolvedRecipeId) throw new Error('Recipe id is required')

    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const next: Partial<Recipe> & Record<string, unknown> = { ...patch }
    const defaultLocale = oneOf<LocaleCode>(
      next.default_locale,
      ['it', 'de', 'en', 'fr'],
      'en'
    )

    if ('name' in next) next.name = trim(next.name)
    if ('slug' in next) next.slug = optional(next.slug) || ''
    if ('recipe_type' in next) {
      next.recipe_type = oneOf<RecipeType>(next.recipe_type, ['prep', 'service'], 'prep')
    }
    if ('default_locale' in next) next.default_locale = defaultLocale
    if ('names' in next) next.names = normalizeLocalizedText(next.names, defaultLocale)
    if ('descriptions' in next) {
      next.descriptions = normalizeLocalizedText(next.descriptions, defaultLocale)
    }
    if ('notes' in next) next.notes = trim(next.notes)

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/recipes`
    await updateDocument<Recipe>(collectionPath, resolvedRecipeId, next)
  }

  return { updateRecipe }
}
