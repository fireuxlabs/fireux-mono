import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, unref, type Ref } from 'vue'
import {
  normalizeTranslatedText,
  RecipeStorage,
  type Recipe,
  type RecipeUpdateInput,
} from '../../../../../models/recipe.model'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/Operations/Collections/useKitchenChildCollection'
import { useKitchenSelection } from '../../../console/kitchen/useKitchenSelection'

const trim = (value: unknown) => String(value || '').trim()
const optional = (value: unknown) => trim(value) || undefined
const normalizeLanguageCode = (value: unknown) => optional(value)?.replace(/_/g, '-')

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

    if ('name' in next) next.name = trim(next.name)
    if ('slug' in next) next.slug = optional(next.slug) || ''
    if ('description' in next) next.description = trim(next.description)
    if ('source_language' in next) {
      next.source_language = normalizeLanguageCode(next.source_language) || ''
    }
    if ('names' in next) next.names = normalizeTranslatedText(next.names)
    if ('descriptions' in next) {
      next.descriptions = normalizeTranslatedText(next.descriptions)
    }

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${RecipeStorage.collection}`
    await updateDocument<Recipe>(collectionPath, resolvedRecipeId, next)
  }

  return { updateRecipe }
}
