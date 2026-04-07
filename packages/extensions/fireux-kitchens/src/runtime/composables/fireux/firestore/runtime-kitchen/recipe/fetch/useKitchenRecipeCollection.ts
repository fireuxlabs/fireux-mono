import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import { normalizeRecipe, type Recipe } from '../../../../../../models/recipe.model'
import { useKitchenSelection } from '../../../../app/kitchen-console/useKitchenSelection'
import { resolveKitchenConsoleCollectionPath } from '../../../../app/kitchen-console/shared'

const resolveRecipesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/recipes`

type UseKitchenRecipeCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenRecipeCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenRecipeCollectionOptions = {}
) {
  const { runtimeKitchenId } = useKitchenSelection()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { appId } = useFireUXConfig()

  const resolvedKitchenId = computed(() =>
    String(unref(kitchenId) || runtimeKitchenId.value || '').trim()
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

  const collectionRef = shallowRef(null) as ShallowRef<Ref<Record<string, unknown>[] | undefined> | null>

  watch(
    collectionPath,
    (nextPath) => {
      collectionRef.value = nextPath ? firestoreFetchCollection<Record<string, unknown>>(nextPath) : null
    },
    { immediate: true }
  )

  const recipes = computed<Recipe[]>(() =>
    (collectionRef.value?.value ?? []).map((entry) => normalizeRecipe(entry))
  )

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    recipes,
    count: computed(() => recipes.value.length),
  }
}
