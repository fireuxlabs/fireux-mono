import type { Ref } from 'vue'
import { computed } from 'vue'
import { useKitchenDishCollection } from '../../dish/fetch/useKitchenDishCollection'
import { useKitchenMenuCollection } from '../../menu/fetch/useKitchenMenuCollection'
import { useKitchenMiseCollection } from '../../mise/fetch/useKitchenMiseCollection'
import { useKitchenRecipeCollection } from '../../recipe/fetch/useKitchenRecipeCollection'

type UseKitchenMenuStackFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenMenuStackFetch(
  kitchenId: Ref<string> | string,
  options: UseKitchenMenuStackFetchOptions = {}
) {
  const { menus, kitchenId: resolvedKitchenId, kitchenCollectionPath } =
    useKitchenMenuCollection(kitchenId, options)
  const { dishes } = useKitchenDishCollection(kitchenId, options)
  const { recipes } = useKitchenRecipeCollection(kitchenId, options)
  const { miseTasks } = useKitchenMiseCollection(kitchenId, options)

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
