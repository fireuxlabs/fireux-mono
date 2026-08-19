import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'
import { computed, unref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { RecipeStorage } from '../../../../models/recipe.model.ts'
import { useKitchenConsoleSelection } from '../../../console/core/useKitchenConsoleSelection'
import { resolveKitchenScopeCollectionPath } from '../../utils/paths/useKitchenChildCollection'

const trim = (value: unknown) => String(value || '').trim()

export function useRecipeDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleSelection()

  const kitchenCollectionPath = computed(() =>
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
