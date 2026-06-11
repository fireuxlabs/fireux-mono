import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { computed, unref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { RecipeStorage } from '../../../../../models/recipe.model'
import { useKitchenConsoleTargets } from '../../../console/kitchen/useKitchenConsoleTargets'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'

const trim = (value: unknown) => String(value || '').trim()

export function useRecipeDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleTargets()

  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || '').trim() ||
    resolveKitchenScopeCollectionPath(appId)
  )

  const deleteRecipe = async (
    recipeId: string,
    overrides: { kitchenId?: string } = {}
  ) => {
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
