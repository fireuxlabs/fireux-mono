import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import type { Dish } from '../../../../../../models/dish.model'
import type { KitchenMiseTask } from '../../../../../../models/kitchen-mise.model'
import type { Menu } from '../../../../../../models/menu.model'
import type { Recipe } from '../../../../../../models/recipe.model'

const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const resolveKitchenCollectionPath = (
  kitchenCollectionPath: string,
  kitchenId: string,
  collectionName: string
) => `${kitchenCollectionPath}/${kitchenId}/${collectionName}`

type UseKitchenMenuStackFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

function useKitchenSubcollection<T>(collectionPath: Ref<string>) {
  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionRef = shallowRef(null) as ShallowRef<Ref<T[] | undefined> | null>

  watch(
    collectionPath,
    (nextPath) => {
      collectionRef.value = nextPath ? firestoreFetchCollection<T>(nextPath) : null
    },
    { immediate: true }
  )

  return computed<T[]>(() => collectionRef.value?.value ?? [])
}

export function useKitchenMenuStackFetch(
  kitchenId: Ref<string> | string,
  options: UseKitchenMenuStackFetchOptions = {}
) {
  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )
  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || DEFAULT_KITCHEN_COLLECTION_PATH).trim()
  )

  const menusPath = computed(() =>
    resolvedKitchenId.value
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value, 'menus')
      : ''
  )
  const dishesPath = computed(() =>
    resolvedKitchenId.value
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value, 'dishes')
      : ''
  )
  const recipesPath = computed(() =>
    resolvedKitchenId.value
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value, 'recipes')
      : ''
  )
  const misePath = computed(() =>
    resolvedKitchenId.value
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value, 'mise')
      : ''
  )

  const menus = useKitchenSubcollection<Menu>(menusPath)
  const dishes = useKitchenSubcollection<Dish>(dishesPath)
  const recipes = useKitchenSubcollection<Recipe>(recipesPath)
  const miseTasks = useKitchenSubcollection<KitchenMiseTask>(misePath)

  const counts = computed(() => ({
    menus: menus.value.length,
    dishes: dishes.value.length,
    recipes: recipes.value.length,
    mise: miseTasks.value.length,
  }))

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    menus,
    dishes,
    recipes,
    miseTasks,
    counts,
  }
}
