import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { computed, unref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { RecipeStorage } from '../../utils/recipe.ts'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'
import { resolveKitchenScopeCollectionPath } from '../../utils/kitchen-collection-path'

const trim = (value: unknown) => String(value || '').trim()

export function useRecipeDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { deleteDocument } = useFirestoreDelete({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()

  const kitchenCollectionPath = computed(
    () =>
      String(unref(options.kitchenCollectionPath) || '').trim() ||
      resolveKitchenScopeCollectionPath(appId)
  )

  const deleteRecipe = async (
    recipeId: string,
    overrides: { kitchenId?: string } = {}
  ) => {
    requireWritableData()
    const resolvedRecipeId = trim(recipeId)
    if (!resolvedRecipeId) throw new Error('Recipe id is required')

    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    await deleteDocument(
      `${kitchenCollectionPath.value}/${kitchenId}/${RecipeStorage.collection}`,
      resolvedRecipeId
    )
  }

  return { deleteRecipe }
}
