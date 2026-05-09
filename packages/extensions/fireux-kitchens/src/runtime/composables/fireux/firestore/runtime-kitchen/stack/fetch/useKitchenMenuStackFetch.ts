import type { Ref } from 'vue'
import { computed } from 'vue'
import { useDishCollection } from '../../../dish/fetch/useDishCollection'
import { useKitchenMenuCollection } from '../../menu/fetch/useKitchenMenuCollection'
import { useKitchenMiseCollection } from '../../mise/fetch/useKitchenMiseCollection'
import { useRecipeCollection } from '../../../recipe/fetch/useRecipeCollection'

type UseKitchenMenuStackFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenMenuStackFetch(
  kitchenId: Ref<string> | string,
  options: UseKitchenMenuStackFetchOptions = {}
) {
  const { menus, kitchenId: resolvedKitchenId, kitchenCollectionPath } =
    useKitchenMenuCollection(kitchenId, options)
  const { dishes } = useDishCollection(kitchenId, options)
  const { recipes } = useRecipeCollection(kitchenId, options)
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
