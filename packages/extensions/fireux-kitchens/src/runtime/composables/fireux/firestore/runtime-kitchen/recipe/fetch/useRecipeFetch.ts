import { doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, unref, type Ref } from 'vue'
import { normalizeRecipe, type Recipe } from '../../../../../../models/recipe.model'
import { useRuntimeKitchenSelection } from '../../../../app/kitchen-runtime/state'
import { resolveKitchenConsoleCollectionPath } from '../../../../app/kitchen-runtime/shared'

const resolveRecipesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/recipes`

type UseRecipeFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  kitchenId?: string | Ref<string | null | undefined>
}

export function useRecipeFetch(
  recipeId: string | Ref<string | null | undefined>,
  options: UseRecipeFetchOptions = {}
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { runtimeKitchenId } = useRuntimeKitchenSelection()

  const resolvedRecipeId = computed(() => String(unref(recipeId) || '').trim())
  const resolvedKitchenId = computed(() =>
    String(unref(options.kitchenId) || runtimeKitchenId.value || '').trim()
  )
  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || '').trim() ||
    resolveKitchenConsoleCollectionPath(appId)
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveRecipesPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )

  const recipeRef = computed(() => {
    if (!collectionPath.value || !resolvedRecipeId.value) return null
    return doc(db, collectionPath.value, resolvedRecipeId.value)
  })

  const { data, pending, error } = useDocument(recipeRef, {
    ssrKey: computed(() =>
      recipeRef.value ? `${collectionPath.value}-${resolvedRecipeId.value}` : undefined
    ),
    transform: (docSnap: any) => {
      if (!docSnap?.exists?.()) return undefined
      return normalizeRecipe({ id: docSnap.id, ...(docSnap.data() ?? {}) })
    },
  } as any)

  return {
    kitchenId: resolvedKitchenId,
    collectionPath,
    recipe: data as Ref<Recipe | undefined>,
    pending,
    error,
  }
}
