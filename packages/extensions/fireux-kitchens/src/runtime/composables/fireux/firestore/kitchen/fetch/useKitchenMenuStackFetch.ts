import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import type { KitchenMiseTask } from '../../../../../../models/kitchen-mise.model'
import type { KitchenDish } from '../../../../../../models/kitchen-dish.model'
import type { KitchenMenu } from '../../../../../../models/kitchen-menu.model'
import type { KitchenRecipe } from '../../../../../../models/kitchen-recipe.model'

const resolveKitchenCollectionPath = (kitchenId: string, collectionName: string) =>
  `kitchens/${kitchenId}/${collectionName}`

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

export function useKitchenMenuStackFetch(kitchenId: Ref<string> | string) {
  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const menusPath = computed(() =>
    resolvedKitchenId.value ? resolveKitchenCollectionPath(resolvedKitchenId.value, 'menus') : ''
  )
  const dishesPath = computed(() =>
    resolvedKitchenId.value ? resolveKitchenCollectionPath(resolvedKitchenId.value, 'dishes') : ''
  )
  const recipesPath = computed(() =>
    resolvedKitchenId.value ? resolveKitchenCollectionPath(resolvedKitchenId.value, 'recipes') : ''
  )
  const misePath = computed(() =>
    resolvedKitchenId.value ? resolveKitchenCollectionPath(resolvedKitchenId.value, 'mise') : ''
  )

  const menus = useKitchenSubcollection<KitchenMenu>(menusPath)
  const dishes = useKitchenSubcollection<KitchenDish>(dishesPath)
  const recipes = useKitchenSubcollection<KitchenRecipe>(recipesPath)
  const miseTasks = useKitchenSubcollection<KitchenMiseTask>(misePath)

  const counts = computed(() => ({
    menus: menus.value.length,
    dishes: dishes.value.length,
    recipes: recipes.value.length,
    mise: miseTasks.value.length,
  }))

  return {
    kitchenId: resolvedKitchenId,
    menus,
    dishes,
    recipes,
    miseTasks,
    counts,
  }
}

