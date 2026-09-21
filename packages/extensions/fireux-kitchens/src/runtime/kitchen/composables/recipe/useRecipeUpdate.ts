import { readRecipeUpdate } from '../../utils/recipe-update-input'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { computed, unref, type Ref } from 'vue'
import {
  RecipeStorage,
  type Recipe,
  type RecipeUpdateInput,
} from '../../utils/recipe.ts'
import { resolveKitchenScopeCollectionPath } from '../../utils/kitchen-collection-path'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'

const trim = (value: unknown) => String(value || '').trim()
export function useRecipeUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()

  const kitchenCollectionPath = computed(
    () =>
      trim(unref(options.kitchenCollectionPath)) ||
      resolveKitchenScopeCollectionPath(appId)
  )

  const updateRecipe = async (
    recipeId: string,
    patch: Partial<RecipeUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string } = {}
  ) => {
    requireWritableData()
    const resolvedRecipeId = trim(recipeId)
    if (!resolvedRecipeId) throw new Error('Recipe id is required')

    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const next = readRecipeUpdate(patch)

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${RecipeStorage.collection}`
    await updateDocument<Recipe>(collectionPath, resolvedRecipeId, next)
  }

  return { updateRecipe }
}
